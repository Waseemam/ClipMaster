// Standalone Data Migration Script
// Run this once to migrate data from API server to local JSON database
// Usage: node migrate-data.js

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = 'http://ammarserver:3001/api';
const DB_PATH = path.join(process.env.APPDATA || process.env.HOME, 'ClipMaster', 'clipmaster.json');

// HTTP request helper
function request(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Load or create database
function loadDatabase() {
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  }
  
  // Create directory if it doesn't exist
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  return {
    notes: [],
    clipboard_history: [],
    folders: [],
    tags: [],
    nextId: {
      notes: 1,
      clipboard: 1,
      folders: 1,
      tags: 1
    }
  };
}

// Save database
function saveDatabase(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

// Main migration function
async function migrate() {
  console.log('🔄 Starting data migration from API to local JSON database...');
  console.log(`📁 Database path: ${DB_PATH}\n`);
  
  const db = loadDatabase();
  const stats = {
    folders: { migrated: 0, failed: 0 },
    notes: { migrated: 0, failed: 0 },
    clipboard: { migrated: 0, failed: 0 },
    errors: []
  };

  try {
    // Migrate Folders
    console.log('📁 Migrating folders...');
    try {
      const response = await request(`${API_BASE_URL}/folders`);
      if (response.success && response.data) {
        for (const folder of response.data) {
          try {
            db.folders.push({
              id: db.nextId.folders++,
              name: folder.name,
              color: folder.color || null,
              created_at: folder.createdAt || new Date().toISOString(),
              updated_at: folder.updatedAt || new Date().toISOString()
            });
            stats.folders.migrated++;
          } catch (error) {
            console.error(`  ❌ Failed to migrate folder: ${folder.name}`);
            stats.folders.failed++;
            stats.errors.push(`Folder: ${error.message}`);
          }
        }
      }
      console.log(`  ✅ Migrated ${stats.folders.migrated} folders\n`);
    } catch (error) {
      console.error(`  ❌ Failed to fetch folders: ${error.message}\n`);
    }

    // Migrate Notes
    console.log('📝 Migrating notes...');
    try {
      const response = await request(`${API_BASE_URL}/notes`);
      if (response.success && response.data && response.data.notes) {
        for (const note of response.data.notes) {
          try {
            db.notes.push({
              id: db.nextId.notes++,
              title: note.title,
              content: note.content,
              folder_id: note.folderId || note.folder_id || null,
              tags: note.tags || [],
              created_at: note.createdAt || new Date().toISOString(),
              updated_at: note.updatedAt || new Date().toISOString()
            });
            stats.notes.migrated++;
          } catch (error) {
            console.error(`  ❌ Failed to migrate note: ${note.title}`);
            stats.notes.failed++;
            stats.errors.push(`Note: ${error.message}`);
          }
        }
      }
      console.log(`  ✅ Migrated ${stats.notes.migrated} notes\n`);
    } catch (error) {
      console.error(`  ❌ Failed to fetch notes: ${error.message}\n`);
    }

    // Migrate Clipboard History
    console.log('📋 Migrating clipboard history...');
    try {
      const response = await request(`${API_BASE_URL}/clipboard`);
      if (response.success && response.data && response.data.items) {
        for (const item of response.data.items) {
          try {
            let title = null;
            let content = item.content;
            
            // Parse old format: "title, content"
            const commaIndex = item.content.indexOf(', ');
            if (commaIndex > 0 && commaIndex < 100) {
              title = item.content.substring(0, commaIndex);
              content = item.content.substring(commaIndex + 2);
            } else {
              title = content.split('\n')[0].substring(0, 60).trim() || 'Clipboard Item';
            }
            
            db.clipboard_history.push({
              id: db.nextId.clipboard++,
              content: content,
              type: item.type,
              title: title,
              created_at: item.createdAt || new Date().toISOString()
            });
            stats.clipboard.migrated++;
          } catch (error) {
            console.error(`  ❌ Failed to migrate clipboard item`);
            stats.clipboard.failed++;
            stats.errors.push(`Clipboard: ${error.message}`);
          }
        }
      }
      console.log(`  ✅ Migrated ${stats.clipboard.migrated} clipboard items\n`);
    } catch (error) {
      console.error(`  ❌ Failed to fetch clipboard history: ${error.message}\n`);
    }

    // Save database
    saveDatabase(db);
    
    // Print summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📊 Summary:`);
    console.log(`   Folders:   ${stats.folders.migrated} migrated, ${stats.folders.failed} failed`);
    console.log(`   Notes:     ${stats.notes.migrated} migrated, ${stats.notes.failed} failed`);
    console.log(`   Clipboard: ${stats.clipboard.migrated} migrated, ${stats.clipboard.failed} failed`);
    
    if (stats.errors.length > 0) {
      console.log(`\n⚠️  ${stats.errors.length} errors occurred:`);
      stats.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    console.log(`\n📁 Database saved to: ${DB_PATH}`);
    console.log('\nYou can now start your app and all data will be available locally!');
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    process.exit(1);
  }
}

// Run migration
migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

