// Data Migration Utility
// Migrates data from remote API server to local SQLite database

import { api } from './api';
import { db } from './localDb';

export async function migrateFromApiToLocal() {
  const migrationLog = {
    success: false,
    notes: { migrated: 0, failed: 0 },
    clipboard: { migrated: 0, failed: 0 },
    folders: { migrated: 0, failed: 0 },
    errors: []
  };

  try {
    console.log('🔄 Starting data migration from API to local database...');

    // Step 1: Migrate Folders
    console.log('📁 Migrating folders...');
    try {
      const foldersResponse = await api.getFolders();
      if (foldersResponse.success && foldersResponse.data) {
        for (const folder of foldersResponse.data) {
          try {
            await db.createFolder({
              name: folder.name,
              color: folder.color
            });
            migrationLog.folders.migrated++;
          } catch (error) {
            console.error('Failed to migrate folder:', folder, error);
            migrationLog.folders.failed++;
            migrationLog.errors.push(`Folder: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      migrationLog.errors.push(`Folders fetch: ${error.message}`);
    }

    // Step 2: Migrate Notes
    console.log('📝 Migrating notes...');
    try {
      const notesResponse = await api.getNotes();
      if (notesResponse.success && notesResponse.data) {
        for (const note of notesResponse.data) {
          try {
            await db.createNote({
              title: note.title,
              content: note.content,
              folderId: note.folderId || note.folder_id || null,
              tags: note.tags || []
            });
            migrationLog.notes.migrated++;
          } catch (error) {
            console.error('Failed to migrate note:', note.title, error);
            migrationLog.notes.failed++;
            migrationLog.errors.push(`Note "${note.title}": ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      migrationLog.errors.push(`Notes fetch: ${error.message}`);
    }

    // Step 3: Migrate Clipboard History
    console.log('📋 Migrating clipboard history...');
    try {
      const clipboardResponse = await api.getClipboardHistory();
      if (clipboardResponse.success && clipboardResponse.data && clipboardResponse.data.items) {
        for (const item of clipboardResponse.data.items) {
          try {
            // Parse title from content if it's in the format "{title}, {content}"
            let title = null;
            let content = item.content;
            
            if (item.content.includes(', ')) {
              const firstCommaIndex = item.content.indexOf(', ');
              title = item.content.substring(0, firstCommaIndex);
              content = item.content.substring(firstCommaIndex + 2);
            }
            
            await db.saveClipboardItem({
              content: content,
              type: item.type,
              title: title
            });
            migrationLog.clipboard.migrated++;
          } catch (error) {
            console.error('Failed to migrate clipboard item:', error);
            migrationLog.clipboard.failed++;
            migrationLog.errors.push(`Clipboard: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch clipboard history:', error);
      migrationLog.errors.push(`Clipboard fetch: ${error.message}`);
    }

    migrationLog.success = true;
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Summary:
      - Folders: ${migrationLog.folders.migrated} migrated, ${migrationLog.folders.failed} failed
      - Notes: ${migrationLog.notes.migrated} migrated, ${migrationLog.notes.failed} failed
      - Clipboard: ${migrationLog.clipboard.migrated} migrated, ${migrationLog.clipboard.failed} failed
    `);

    return migrationLog;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    migrationLog.errors.push(`General: ${error.message}`);
    return migrationLog;
  }
}

// Helper function to check if migration is needed
export async function checkMigrationNeeded() {
  try {
    // Check if local database has any data
    const localNotes = await db.getNotes();
    const localClipboard = await db.getClipboardHistory({ limit: 1 });
    
    const hasLocalData = (localNotes.data && localNotes.data.length > 0) || 
                        (localClipboard.data && localClipboard.data.items && localClipboard.data.items.length > 0);
    
    if (hasLocalData) {
      console.log('Local database already has data, migration not needed');
      return false;
    }

    // Check if API server has data
    try {
      const apiNotes = await api.getNotes({ limit: 1 });
      const hasApiData = apiNotes.success && apiNotes.data && apiNotes.data.length > 0;
      
      if (hasApiData) {
        console.log('API server has data, migration needed');
        return true;
      }
    } catch (error) {
      console.log('Cannot reach API server, no migration needed');
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

