const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class ClipMasterDB {
  constructor() {
    // Store database in user data directory
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'clipmaster.db');
    
    console.log('Database path:', dbPath);
    this.db = new Database(dbPath);
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Initialize tables
    this.initializeTables();
  }

  initializeTables() {
    // Folders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        folder_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
      )
    `);

    // Tags table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Note-Tag junction table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS note_tags (
        note_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (note_id, tag_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Clipboard history table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clipboard_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);
      CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_clipboard_created ON clipboard_history(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
    `);
  }

  // ==================== NOTES ====================
  
  getNotes(params = {}) {
    let query = `
      SELECT n.*, 
        GROUP_CONCAT(t.name) as tags
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
    `;
    
    const conditions = [];
    const values = [];
    
    if (params.folderId) {
      conditions.push('n.folder_id = ?');
      values.push(params.folderId);
    }
    
    if (params.search) {
      conditions.push('(n.title LIKE ? OR n.content LIKE ?)');
      const searchTerm = `%${params.search}%`;
      values.push(searchTerm, searchTerm);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY n.id ORDER BY n.updated_at DESC';
    
    if (params.limit) {
      query += ` LIMIT ${parseInt(params.limit)}`;
    }
    
    const notes = this.db.prepare(query).all(...values);
    
    // Parse tags from comma-separated string to array
    return notes.map(note => ({
      ...note,
      tags: note.tags ? note.tags.split(',') : []
    }));
  }

  getNote(id) {
    const note = this.db.prepare(`
      SELECT n.*, 
        GROUP_CONCAT(t.name) as tags
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.id = ?
      GROUP BY n.id
    `).get(id);
    
    if (!note) return null;
    
    return {
      ...note,
      tags: note.tags ? note.tags.split(',') : []
    };
  }

  createNote(noteData) {
    const { title, content, folderId, tags } = noteData;
    
    // Start transaction
    const transaction = this.db.transaction(() => {
      // Insert note
      const result = this.db.prepare(`
        INSERT INTO notes (title, content, folder_id)
        VALUES (?, ?, ?)
      `).run(title, content, folderId || null);
      
      const noteId = result.lastInsertRowid;
      
      // Add tags if provided
      if (tags && tags.length > 0) {
        this.addTagsToNote(noteId, tags);
      }
      
      return this.getNote(noteId);
    });
    
    return transaction();
  }

  updateNote(id, noteData) {
    const { title, content, folderId, tags } = noteData;
    
    const transaction = this.db.transaction(() => {
      // Update note
      this.db.prepare(`
        UPDATE notes 
        SET title = ?, content = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, content, folderId || null, id);
      
      // Update tags if provided
      if (tags !== undefined) {
        // Remove existing tags
        this.db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id);
        
        // Add new tags
        if (tags.length > 0) {
          this.addTagsToNote(id, tags);
        }
      }
      
      return this.getNote(id);
    });
    
    return transaction();
  }

  deleteNote(id) {
    const result = this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // ==================== TAGS ====================
  
  addTagsToNote(noteId, tags) {
    const getOrCreateTag = this.db.prepare(`
      INSERT OR IGNORE INTO tags (name) VALUES (?);
      SELECT id FROM tags WHERE name = ?;
    `);
    
    const linkTag = this.db.prepare(`
      INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)
    `);
    
    for (const tagName of tags) {
      getOrCreateTag.run(tagName);
      const tag = this.db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName);
      linkTag.run(noteId, tag.id);
    }
  }

  getTags() {
    return this.db.prepare(`
      SELECT t.*, COUNT(nt.note_id) as usage_count
      FROM tags t
      LEFT JOIN note_tags nt ON t.id = nt.id
      GROUP BY t.id
      ORDER BY t.name
    `).all();
  }

  // ==================== FOLDERS ====================
  
  getFolders() {
    return this.db.prepare(`
      SELECT f.*, COUNT(n.id) as note_count
      FROM folders f
      LEFT JOIN notes n ON f.id = n.folder_id
      GROUP BY f.id
      ORDER BY f.name
    `).all();
  }

  createFolder(folderData) {
    const { name, color } = folderData;
    const result = this.db.prepare(`
      INSERT INTO folders (name, color) VALUES (?, ?)
    `).run(name, color || null);
    
    return this.db.prepare('SELECT * FROM folders WHERE id = ?').get(result.lastInsertRowid);
  }

  updateFolder(id, folderData) {
    const { name, color } = folderData;
    this.db.prepare(`
      UPDATE folders 
      SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, color || null, id);
    
    return this.db.prepare('SELECT * FROM folders WHERE id = ?').get(id);
  }

  deleteFolder(id) {
    const result = this.db.prepare('DELETE FROM folders WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // ==================== CLIPBOARD ====================
  
  getClipboardHistory(params = {}) {
    let query = 'SELECT * FROM clipboard_history';
    const conditions = [];
    const values = [];
    
    if (params.type) {
      conditions.push('type = ?');
      values.push(params.type);
    }
    
    if (params.search) {
      conditions.push('(title LIKE ? OR content LIKE ?)');
      const searchTerm = `%${params.search}%`;
      values.push(searchTerm, searchTerm);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (params.limit) {
      query += ` LIMIT ${parseInt(params.limit)}`;
    } else {
      query += ' LIMIT 1000'; // Default limit
    }
    
    return this.db.prepare(query).all(...values);
  }

  saveClipboardItem(itemData) {
    const { content, type, title } = itemData;
    
    // Check for duplicate in recent history (last 50 items)
    const recentDuplicate = this.db.prepare(`
      SELECT id FROM clipboard_history 
      WHERE content = ? AND type = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).get(content, type);
    
    if (recentDuplicate) {
      // Update timestamp instead of creating duplicate
      this.db.prepare(`
        UPDATE clipboard_history 
        SET created_at = CURRENT_TIMESTAMP, title = ?
        WHERE id = ?
      `).run(title || null, recentDuplicate.id);
      
      return this.db.prepare('SELECT * FROM clipboard_history WHERE id = ?').get(recentDuplicate.id);
    }
    
    const result = this.db.prepare(`
      INSERT INTO clipboard_history (content, type, title)
      VALUES (?, ?, ?)
    `).run(content, type, title || null);
    
    return this.db.prepare('SELECT * FROM clipboard_history WHERE id = ?').get(result.lastInsertRowid);
  }

  deleteClipboardItem(id) {
    const result = this.db.prepare('DELETE FROM clipboard_history WHERE id = ?').run(id);
    return result.changes > 0;
  }

  clearClipboardHistory() {
    const result = this.db.prepare('DELETE FROM clipboard_history').run();
    return result.changes;
  }

  // ==================== SEARCH ====================
  
  search(query) {
    const searchTerm = `%${query}%`;
    
    const notes = this.db.prepare(`
      SELECT 'note' as type, id, title as name, content as preview, created_at
      FROM notes
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY updated_at DESC
      LIMIT 50
    `).all(searchTerm, searchTerm);
    
    const clipboard = this.db.prepare(`
      SELECT 'clipboard' as type, id, title as name, content as preview, created_at
      FROM clipboard_history
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(searchTerm, searchTerm);
    
    return [...notes, ...clipboard];
  }

  // ==================== UTILITY ====================
  
  close() {
    this.db.close();
  }
}

module.exports = ClipMasterDB;

