import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

class ClipMasterDB {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Store database in user data directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'clipmaster.db');
    
    console.log('Database path:', this.dbPath);

    // Initialize sql.js
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
      console.log('Loaded existing database');
    } else {
      this.db = new SQL.Database();
      console.log('Created new database');
    }
    
    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');
    
    // Initialize tables
    this.initializeTables();
    
    // Save database
    this.save();
    
    this.initialized = true;
  }

  save() {
    if (!this.db || !this.dbPath) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  initializeTables() {
    // Folders table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notes table
    this.db.run(`
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
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Note-Tag junction table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS note_tags (
        note_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (note_id, tag_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    // Clipboard history table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS clipboard_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_clipboard_created ON clipboard_history(created_at DESC)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)`);
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
    
    const result = this.db.exec(query, values);
    if (!result.length) return [];
    
    const notes = this.rowsToObjects(result[0]);
    
    // Parse tags from comma-separated string to array
    return notes.map(note => ({
      ...note,
      tags: note.tags ? note.tags.split(',') : []
    }));
  }

  rowsToObjects(resultSet) {
    if (!resultSet || !resultSet.columns || !resultSet.values) return [];
    const { columns, values } = resultSet;
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  getNote(id) {
    const result = this.db.exec(`
      SELECT n.*, 
        GROUP_CONCAT(t.name) as tags
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.id = ?
      GROUP BY n.id
    `, [id]);
    
    if (!result.length) return null;
    
    const notes = this.rowsToObjects(result[0]);
    if (!notes.length) return null;
    
    const note = notes[0];
    return {
      ...note,
      tags: note.tags ? note.tags.split(',') : []
    };
  }

  createNote(noteData) {
    const { title, content, folderId, tags } = noteData;
    
    // Insert note
    this.db.run(`
      INSERT INTO notes (title, content, folder_id)
      VALUES (?, ?, ?)
    `, [title, content, folderId || null]);
    
    // Get the last inserted ID
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const noteId = result[0].values[0][0];
    
    // Add tags if provided
    if (tags && tags.length > 0) {
      this.addTagsToNote(noteId, tags);
    }
    
    this.save();
    return this.getNote(noteId);
  }

  updateNote(id, noteData) {
    const { title, content, folderId, tags } = noteData;
    
    // Update note
    this.db.run(`
      UPDATE notes 
      SET title = ?, content = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, content, folderId || null, id]);
    
    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      this.db.run('DELETE FROM note_tags WHERE note_id = ?', [id]);
      
      // Add new tags
      if (tags.length > 0) {
        this.addTagsToNote(id, tags);
      }
    }
    
    this.save();
    return this.getNote(id);
  }

  deleteNote(id) {
    this.db.run('DELETE FROM notes WHERE id = ?', [id]);
    const result = this.db.exec('SELECT changes() as changes');
    this.save();
    return result[0].values[0][0] > 0;
  }

  // ==================== TAGS ====================
  
  addTagsToNote(noteId, tags) {
    for (const tagName of tags) {
      // Insert or ignore tag
      this.db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName]);
      
      // Get tag ID
      const result = this.db.exec('SELECT id FROM tags WHERE name = ?', [tagName]);
      if (result.length && result[0].values.length) {
        const tagId = result[0].values[0][0];
        
        // Link tag to note
        this.db.run('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)', [noteId, tagId]);
      }
    }
  }

  getTags() {
    const result = this.db.exec(`
      SELECT t.*, COUNT(nt.note_id) as usage_count
      FROM tags t
      LEFT JOIN note_tags nt ON t.id = nt.tag_id
      GROUP BY t.id
      ORDER BY t.name
    `);
    if (!result.length) return [];
    return this.rowsToObjects(result[0]);
  }

  // ==================== FOLDERS ====================
  
  getFolders() {
    const result = this.db.exec(`
      SELECT f.*, COUNT(n.id) as note_count
      FROM folders f
      LEFT JOIN notes n ON f.id = n.folder_id
      GROUP BY f.id
      ORDER BY f.name
    `);
    if (!result.length) return [];
    return this.rowsToObjects(result[0]);
  }

  createFolder(folderData) {
    const { name, color } = folderData;
    this.db.run('INSERT INTO folders (name, color) VALUES (?, ?)', [name, color || null]);
    
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const folderId = result[0].values[0][0];
    
    const folderResult = this.db.exec('SELECT * FROM folders WHERE id = ?', [folderId]);
    this.save();
    if (!folderResult.length) return null;
    return this.rowsToObjects(folderResult[0])[0];
  }

  updateFolder(id, folderData) {
    const { name, color } = folderData;
    this.db.run(`
      UPDATE folders 
      SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, color || null, id]);
    
    const result = this.db.exec('SELECT * FROM folders WHERE id = ?', [id]);
    this.save();
    if (!result.length) return null;
    return this.rowsToObjects(result[0])[0];
  }

  deleteFolder(id) {
    this.db.run('DELETE FROM folders WHERE id = ?', [id]);
    const result = this.db.exec('SELECT changes() as changes');
    this.save();
    return result[0].values[0][0] > 0;
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
    
    const result = this.db.exec(query, values);
    if (!result.length) return [];
    return this.rowsToObjects(result[0]);
  }

  saveClipboardItem(itemData) {
    const { content, type, title } = itemData;
    
    // Check for duplicate in recent history (last 50 items)
    const dupResult = this.db.exec(`
      SELECT id FROM clipboard_history 
      WHERE content = ? AND type = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [content, type]);
    
    if (dupResult.length && dupResult[0].values.length > 0) {
      const duplicateId = dupResult[0].values[0][0];
      // Update timestamp instead of creating duplicate
      this.db.run(`
        UPDATE clipboard_history 
        SET created_at = CURRENT_TIMESTAMP, title = ?
        WHERE id = ?
      `, [title || null, duplicateId]);
      
      const itemResult = this.db.exec('SELECT * FROM clipboard_history WHERE id = ?', [duplicateId]);
      this.save();
      if (!itemResult.length) return null;
      return this.rowsToObjects(itemResult[0])[0];
    }
    
    this.db.run(`
      INSERT INTO clipboard_history (content, type, title)
      VALUES (?, ?, ?)
    `, [content, type, title || null]);
    
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const itemId = result[0].values[0][0];
    
    const itemResult = this.db.exec('SELECT * FROM clipboard_history WHERE id = ?', [itemId]);
    this.save();
    if (!itemResult.length) return null;
    return this.rowsToObjects(itemResult[0])[0];
  }

  deleteClipboardItem(id) {
    this.db.run('DELETE FROM clipboard_history WHERE id = ?', [id]);
    const result = this.db.exec('SELECT changes() as changes');
    this.save();
    return result[0].values[0][0] > 0;
  }

  clearClipboardHistory() {
    this.db.run('DELETE FROM clipboard_history');
    const result = this.db.exec('SELECT changes() as changes');
    this.save();
    return result[0].values[0][0];
  }

  // ==================== SEARCH ====================
  
  search(query) {
    const searchTerm = `%${query}%`;
    
    const notesResult = this.db.exec(`
      SELECT 'note' as type, id, title as name, content as preview, created_at
      FROM notes
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY updated_at DESC
      LIMIT 50
    `, [searchTerm, searchTerm]);
    
    const clipboardResult = this.db.exec(`
      SELECT 'clipboard' as type, id, title as name, content as preview, created_at
      FROM clipboard_history
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [searchTerm, searchTerm]);
    
    const notes = notesResult.length ? this.rowsToObjects(notesResult[0]) : [];
    const clipboard = clipboardResult.length ? this.rowsToObjects(clipboardResult[0]) : [];
    
    return [...notes, ...clipboard];
  }

  // ==================== UTILITY ====================
  
  close() {
    if (this.db) {
      this.save();
      this.db.close();
    }
  }
}

export default ClipMasterDB;

