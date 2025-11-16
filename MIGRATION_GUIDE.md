# Database Migration Guide

## ✅ Migration Complete!

Your ClipMaster app has been successfully migrated from using a remote API server to a **local SQLite database**.

## What Changed?

### 1. **Local Storage** 
- All your notes and clipboard history are now stored locally in: `%APPDATA%/ClipMaster/clipmaster.db`
- No more dependency on the remote API server (`http://ammarserver:3001`)
- Faster performance and offline support

### 2. **New Architecture**
```
┌─────────────────┐
│   React UI      │
│  (Components)   │
└────────┬────────┘
         │
┌────────▼────────┐
│   localDb.js    │  ← New local DB client
│  (IPC Wrapper)  │
└────────┬────────┘
         │
┌────────▼────────┐
│   preload.js    │  ← IPC Bridge
│  (Context API)  │
└────────┬────────┘
         │
┌────────▼────────┐
│    main.js      │  ← IPC Handlers
│ (Main Process)  │
└────────┬────────┘
         │
┌────────▼────────┐
│  database.js    │  ← SQLite Database
│ (better-sqlite3)│
└─────────────────┘
```

### 3. **Automatic Data Migration**
- On first run, the app automatically checks if you have data in the old API server
- If data exists, it migrates everything to the local database:
  - ✅ Notes (with tags and folders)
  - ✅ Clipboard history (with AI-generated titles)
  - ✅ Folders
  - ✅ Tags

## Database Schema

### Tables Created:
- **notes** - Your markdown notes with title, content, folder association
- **clipboard_history** - All clipboard items with content, type, and title
- **folders** - Organizational folders for notes
- **tags** - Tags for categorizing notes
- **note_tags** - Junction table linking notes and tags

## Files Modified/Created

### Created:
- `src/lib/database.js` - SQLite database layer with better-sqlite3
- `src/lib/localDb.js` - Local database client (replaces API calls)
- `src/lib/migrate.js` - One-time migration utility

### Modified:
- `src/main.js` - Added database initialization and IPC handlers
- `src/preload.js` - Exposed database methods to renderer process
- `src/App.jsx` - Replaced API calls with local database
- `src/components/ClipboardPage.jsx` - Updated to use local database
- `forge.config.js` - Fixed for native module support
- `package.json` - Added better-sqlite3 dependency

## Forge Configuration Fixed

The Electron Forge configuration was updated to support native SQLite modules:

```javascript
// forge.config.js changes:
packagerConfig: {
  asar: {
    unpack: '*.{node,dll}'  // Unpacks native modules
  }
}

// Added plugin:
{
  name: '@electron-forge/plugin-auto-unpack-natives',
  config: {}
}

// Fixed fuse:
[FuseV1Options.OnlyLoadAppFromAsar]: false  // Allows unpacked modules
```

## Building Your App

Now you can safely build your app with SQLite support:

```bash
# Development
npm start

# Package (create distributable)
npm run package

# Create installer
npm run make
```

## Testing the Migration

1. **Start the app** - It will automatically check for migration
2. **Check the console** - Look for migration messages:
   - `🔄 Migration needed, starting data migration...`
   - `✅ Migration completed successfully!`
3. **Verify data** - All your notes and clipboard history should be visible

## Database Location

- **Windows**: `C:\Users\YourName\AppData\Roaming\ClipMaster\clipmaster.db`
- **macOS**: `~/Library/Application Support/ClipMaster/clipmaster.db`
- **Linux**: `~/.config/ClipMaster/clipmaster.db`

## Backup Your Data

To backup your data, simply copy the `clipmaster.db` file to a safe location.

## Old API Server

The old API server (`http://ammarserver:3001`) is **no longer needed**. You can:
- Keep it running as a backup (migration will only happen once)
- Shut it down completely
- Archive the old server code

## Benefits

✅ **Faster** - No network latency  
✅ **Offline** - Works without internet  
✅ **Private** - Data stays on your machine  
✅ **Reliable** - No server downtime  
✅ **Portable** - Easy to backup and restore  

## Troubleshooting

### Database Not Found Error
- The app will automatically create the database on first run
- Check `%APPDATA%/ClipMaster/` directory exists

### Migration Failed
- Check console logs for specific errors
- Old API server must be accessible during migration
- Can manually import data later if needed

### Native Module Errors
- Ensure `better-sqlite3` is installed: `npm install better-sqlite3`
- Rebuild for Electron: `npm run package`
- Check that Forge config has `unpack: '*.{node,dll}'`

## Need Help?

Check the console for detailed error messages. All database operations log to the console with helpful debugging information.

---

**Migration completed by AI Assistant on** $(date)

