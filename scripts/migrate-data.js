// Standalone migration script to transfer data from API to local SQLite database
// Run this with: node scripts/migrate-data.js

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// API Configuration
const API_BASE_URL = 'http://ammarserver:3001/api';

// Database setup
const userDataPath = process.env.APPDATA || 
  (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library/Application Support') : 
   path.join(process.env.HOME, '.config'));

const dbDir = path.join(userDataPath, 'ClipMaster');
const dbPath = path.join(dbDir, 'clipmaster.db');

// Create directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Created database directory:', dbDir);
}

console.log('📂 Database location:', dbPath);

// Check if database exists and has data
const dbExists = fs.existsSync(dbPath);
if (dbExists) {
  console.log('⚠️  Database file already exists. Backing up...');
  const backupPath = dbPath + '.backup.' + Date.now();
  fs.copyFileSync(dbPath, backupPath);
  console.log('✅ Backup created:', backupPath);
  
  // Delete old database to start fresh
  fs.unlinkSync(dbPath);
  console.log('🗑️  Old database removed');
}

// Initialize database
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Create tables
console.log('🔨 Creating database tables...');
db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    folder_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clipboard_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);
  CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_clipboard_created ON clipboard_history(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
`);

console.log('✅ Database tables created');

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Migration function
async function migrate() {
  const stats = {
    folders: { migrated: 0, failed: 0 },
    notes: { migrated: 0, failed: 0 },
    clipboard: { migrated: 0, failed: 0 },
    errors: []
  };

  try {
    // Migrate Folders
    console.log('\n📁 Migrating folders...');
    try {
      const foldersData = await makeRequest(`${API_BASE_URL}/folders`);
      
      if (foldersData.success && foldersData.data) {
        const insertFolder = db.prepare('INSERT INTO folders (name, color) VALUES (?, ?)');
        
        for (const folder of foldersData.data) {
          try {
            insertFolder.run(folder.name, folder.color || null);
            stats.folders.migrated++;
            console.log(`  ✓ ${folder.name}`);
          } catch (error) {
            stats.folders.failed++;
            stats.errors.push(`Folder "${folder.name}": ${error.message}`);
            console.log(`  ✗ ${folder.name} - ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Could not fetch folders: ${error.message}`);
      stats.errors.push(`Folders fetch: ${error.message}`);
    }

    // Migrate Notes
    console.log('\n📝 Migrating notes...');
    try {
      const notesData = await makeRequest(`${API_BASE_URL}/notes`);
      
      if (notesData.success && notesData.data) {
        const notes = notesData.data.notes || notesData.data;
        const insertNote = db.prepare('INSERT INTO notes (title, content, folder_id) VALUES (?, ?, ?)');
        const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
        const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
        const linkTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
        
        for (const note of notes) {
          try {
            const result = insertNote.run(
              note.title,
              note.content,
              note.folderId || note.folder_id || null
            );
            
            const noteId = result.lastInsertRowid;
            
            // Add tags
            if (note.tags && Array.isArray(note.tags)) {
              for (const tagName of note.tags) {
                insertTag.run(tagName);
                const tag = getTag.get(tagName);
                if (tag) {
                  linkTag.run(noteId, tag.id);
                }
              }
            }
            
            stats.notes.migrated++;
            console.log(`  ✓ ${note.title}`);
          } catch (error) {
            stats.notes.failed++;
            stats.errors.push(`Note "${note.title}": ${error.message}`);
            console.log(`  ✗ ${note.title} - ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Could not fetch notes: ${error.message}`);
      stats.errors.push(`Notes fetch: ${error.message}`);
    }

    // Migrate Clipboard History
    console.log('\n📋 Migrating clipboard history...');
    try {
      const clipboardData = await makeRequest(`${API_BASE_URL}/clipboard`);
      
      if (clipboardData.success && clipboardData.data && clipboardData.data.items) {
        const insertClipboard = db.prepare('INSERT INTO clipboard_history (content, type, title) VALUES (?, ?, ?)');
        
        for (const item of clipboardData.data.items) {
          try {
            // Parse title from content if it's in the format "{title}, {content}"
            let title = null;
            let content = item.content;
            
            if (item.content.includes(', ')) {
              const firstCommaIndex = item.content.indexOf(', ');
              title = item.content.substring(0, firstCommaIndex);
              content = item.content.substring(firstCommaIndex + 2);
            }
            
            insertClipboard.run(content, item.type, title);
            stats.clipboard.migrated++;
            console.log(`  ✓ ${title || 'Clipboard item'}`);
          } catch (error) {
            stats.clipboard.failed++;
            stats.errors.push(`Clipboard item: ${error.message}`);
            console.log(`  ✗ Clipboard item - ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Could not fetch clipboard history: ${error.message}`);
      stats.errors.push(`Clipboard fetch: ${error.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📁 Folders:   ${stats.folders.migrated} migrated, ${stats.folders.failed} failed`);
    console.log(`📝 Notes:     ${stats.notes.migrated} migrated, ${stats.notes.failed} failed`);
    console.log(`📋 Clipboard: ${stats.clipboard.migrated} migrated, ${stats.clipboard.failed} failed`);
    console.log('='.repeat(60));
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      stats.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const totalMigrated = stats.folders.migrated + stats.notes.migrated + stats.clipboard.migrated;
    if (totalMigrated > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log(`📂 Database saved to: ${dbPath}`);
    } else {
      console.log('\n⚠️  No data was migrated. Check if the API server is accessible.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run migration
console.log('🔄 Starting data migration from API to local database...\n');
migrate().catch(console.error);

