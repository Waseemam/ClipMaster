const initSqlJs = require('sql.js');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db = null;
let SQL = null;

// Get the user data path where database will be stored
function getDatabasePath() {
  // Use userData directory - persists across app updates
  // Windows: C:\Users\[username]\AppData\Roaming\ClipMaster
  const userDataPath = app.getPath('userData');
  
  // Ensure the directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  return path.join(userDataPath, 'clipmaster.db');
}

// Initialize database and create tables
async function initDatabase() {
  if (db) return db;

  const dbPath = getDatabasePath();
  console.log('Database path:', dbPath);
  
  // Initialize SQL.js
  if (!SQL) {
    SQL = await initSqlJs();
  }

  // Check if database file exists
  let buffer;
  if (fs.existsSync(dbPath)) {
    // Load existing database
    buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('Loaded existing database');
  } else {
    // Create new database
    db = new SQL.Database();
    console.log('Created new database');
  }
  
  // Create tables
  db.run(`
    -- Notes table
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT, -- JSON array stored as text
      folderId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    -- Clipboard history table
    CREATE TABLE IF NOT EXISTS clipboard_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      type TEXT NOT NULL, -- 'text' or 'image'
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    -- Folders table
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    -- Tags table (optional, for tag management)
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updatedAt DESC);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_clipboard_created ON clipboard_items(createdAt DESC);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folderId);`);

  // Save database to file
  saveDatabase();

  console.log('Database initialized successfully');
  return db;
}

// Save database to file
function saveDatabase() {
  if (!db) return;
  
  try {
    const dbPath = getDatabasePath();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Get database instance
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Helper to convert sql.js result to array of objects
function resultToArray(result) {
  if (!result || result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

// Notes operations
const notesAPI = {
  getAll: (params = {}) => {
    const db = getDatabase();
    let query = 'SELECT * FROM notes ORDER BY updatedAt DESC';
    
    if (params.limit) {
      query += ` LIMIT ${parseInt(params.limit)}`;
    }
    
    const result = db.exec(query);
    const notes = resultToArray(result);
    
    // Parse tags from JSON string
    return notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : []
    }));
  },

  getById: (id) => {
    const db = getDatabase();
    const result = db.exec('SELECT * FROM notes WHERE id = ?', [id]);
    const notes = resultToArray(result);
    
    if (notes.length > 0) {
      const note = notes[0];
      note.tags = note.tags ? JSON.parse(note.tags) : [];
      return note;
    }
    
    return null;
  },

  create: (noteData) => {
    const db = getDatabase();
    const { title, content, tags = [], folderId = null } = noteData;
    
    db.run(
      `INSERT INTO notes (title, content, tags, folderId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [title, content, JSON.stringify(tags), folderId]
    );
    
    // Get the last inserted row
    const result = db.exec('SELECT last_insert_rowid() as id');
    const lastId = result[0].values[0][0];
    
    saveDatabase();
    return notesAPI.getById(lastId);
  },

  update: (id, noteData) => {
    const db = getDatabase();
    const { title, content, tags, folderId } = noteData;
    
    db.run(
      `UPDATE notes
       SET title = ?, content = ?, tags = ?, folderId = ?, updatedAt = datetime('now')
       WHERE id = ?`,
      [title, content, JSON.stringify(tags || []), folderId, id]
    );
    
    saveDatabase();
    return notesAPI.getById(id);
  },

  delete: (id) => {
    const db = getDatabase();
    db.run('DELETE FROM notes WHERE id = ?', [id]);
    saveDatabase();
    return true;
  },

  search: (query) => {
    const db = getDatabase();
    const searchPattern = `%${query}%`;
    
    const result = db.exec(
      `SELECT * FROM notes
       WHERE title LIKE ? OR content LIKE ?
       ORDER BY updatedAt DESC`,
      [searchPattern, searchPattern]
    );
    
    const notes = resultToArray(result);
    
    return notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : []
    }));
  }
};

// Clipboard operations
const clipboardAPI = {
  getAll: (params = {}) => {
    const db = getDatabase();
    let query = 'SELECT * FROM clipboard_items ORDER BY createdAt DESC';
    
    if (params.limit) {
      query += ` LIMIT ${parseInt(params.limit)}`;
    }
    
    const result = db.exec(query);
    return resultToArray(result);
  },

  create: (itemData) => {
    const db = getDatabase();
    const { content, type } = itemData;
    
    db.run(
      `INSERT INTO clipboard_items (content, type, createdAt)
       VALUES (?, ?, datetime('now'))`,
      [content, type]
    );
    
    // Get the last inserted row
    const result = db.exec('SELECT last_insert_rowid() as id');
    const lastId = result[0].values[0][0];
    
    saveDatabase();
    
    const itemResult = db.exec('SELECT * FROM clipboard_items WHERE id = ?', [lastId]);
    const items = resultToArray(itemResult);
    return items[0] || null;
  },

  delete: (id) => {
    const db = getDatabase();
    db.run('DELETE FROM clipboard_items WHERE id = ?', [id]);
    saveDatabase();
    return true;
  },

  clear: () => {
    const db = getDatabase();
    const countResult = db.exec('SELECT COUNT(*) as count FROM clipboard_items');
    const count = countResult[0].values[0][0];
    
    db.run('DELETE FROM clipboard_items');
    saveDatabase();
    return count;
  }
};

// Folders operations
const foldersAPI = {
  getAll: () => {
    const db = getDatabase();
    const result = db.exec('SELECT * FROM folders ORDER BY name');
    return resultToArray(result);
  },

  create: (folderData) => {
    const db = getDatabase();
    const { name } = folderData;
    
    db.run(
      `INSERT INTO folders (name, createdAt)
       VALUES (?, datetime('now'))`,
      [name]
    );
    
    // Get the last inserted row
    const result = db.exec('SELECT last_insert_rowid() as id');
    const lastId = result[0].values[0][0];
    
    saveDatabase();
    
    const folderResult = db.exec('SELECT * FROM folders WHERE id = ?', [lastId]);
    const folders = resultToArray(folderResult);
    return folders[0] || null;
  }
};

// Tags operations
const tagsAPI = {
  getAll: () => {
    const db = getDatabase();
    const result = db.exec('SELECT * FROM tags ORDER BY name');
    return resultToArray(result);
  }
};

// Close database
function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  getDatabasePath,
  saveDatabase,
  notesAPI,
  clipboardAPI,
  foldersAPI,
  tagsAPI
};
