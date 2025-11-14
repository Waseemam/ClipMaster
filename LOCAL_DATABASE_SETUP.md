# Local Database Setup 🎉

ClipMaster now uses **local SQLite storage** - all your data is stored on your machine!

## Quick Summary

✅ **No network required** - Works completely offline  
✅ **Fast** - Local SQLite is instant  
✅ **Private** - All data stays on your machine  
✅ **Simple** - No external database server needed  

## Database Structure

The `clipmaster.db` file contains 4 tables:
- **notes** - Your notes with title, content, tags, and folders
- **clipboard_items** - Clipboard history (text and images)
- **folders** - Note organization
- **tags** - Tag management

## Storage Location

The database is stored in your system's standard user data directory:

**Windows:**
```
C:\Users\ammar\AppData\Roaming\ClipMaster\clipmaster.db
```

**macOS:**
```
~/Library/Application Support/ClipMaster/clipmaster.db
```

**Linux:**
```
~/.config/ClipMaster/clipmaster.db
```

✅ **Persists across app updates** - Your data is safe when you update the app!

## Key Files

- **`src/database.js`** - SQLite database operations
- **`src/main.js`** - Database initialization and IPC handlers
- **`src/preload.js`** - Exposes database API via `window.electronAPI.db`
- **`src/lib/api.js`** - Local database client (replaced remote API)
- **`vite.main.config.mjs`** - Vite plugin to copy database.js to build

## Backup Your Data

To backup, simply copy the `clipmaster.db` file!

---

**Note:** AI features require an OpenAI API key in your `.env` file.

