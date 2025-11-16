# ClipMaster - Local Database

## Overview
ClipMaster now uses a **simple JSON database** stored locally on your machine. No more remote API dependency!

## Database Location
- **Windows**: `C:\Users\YourName\AppData\Roaming\ClipMaster\clipmaster.json`
- **macOS**: `~/Library/Application Support/ClipMaster/clipmaster.json`
- **Linux**: `~/.config/ClipMaster/clipmaster.json`

## Features
✅ **Fast** - All data stored locally  
✅ **Simple** - Human-readable JSON format  
✅ **Reliable** - No network dependencies  
✅ **Portable** - Easy to backup (just copy the JSON file)  
✅ **Zero Native Dependencies** - Pure JavaScript, no compilation needed  

## Database Structure
```json
{
  "notes": [
    {
      "id": 1,
      "title": "Note Title",
      "content": "Note content...",
      "folder_id": null,
      "tags": ["tag1", "tag2"],
      "created_at": "2024-11-16T...",
      "updated_at": "2024-11-16T..."
    }
  ],
  "clipboard_history": [
    {
      "id": 1,
      "content": "Clipboard content",
      "type": "text",
      "title": "Clipboard Title",
      "created_at": "2024-11-16T..."
    }
  ],
  "folders": [],
  "tags": [],
  "nextId": {
    "notes": 2,
    "clipboard": 2,
    "folders": 1,
    "tags": 1
  }
}
```

## Migration
If you previously used the API server, run the migration script **once**:

```bash
node migrate-data.js
```

This will copy all your data from the API server to the local JSON database.

## Backup & Restore

### Backup
Simply copy the database file:
```bash
# Windows
copy "%APPDATA%\ClipMaster\clipmaster.json" "C:\Backups\"

# macOS/Linux
cp ~/Library/Application\ Support/ClipMaster/clipmaster.json ~/Backups/
```

### Restore
Copy the backup file back to the database location.

## Technical Details

### Implementation
- **File**: `src/lib/jsonDb.js`
- **Type**: Synchronous JSON file I/O
- **Auto-save**: Every write operation saves to disk
- **Thread-safe**: All operations run in the main Electron process

### API
The JSON database exposes the same API as the old SQL database:
- `getNotes(params)` - Get all notes with optional filtering
- `createNote(data)` - Create a new note
- `updateNote(id, data)` - Update existing note
- `deleteNote(id)` - Delete a note
- `getClipboardHistory(params)` - Get clipboard history
- `saveClipboardItem(data)` - Save clipboard item
- And more...

### Why JSON instead of SQL?
1. **No Native Modules** - Works everywhere without compilation
2. **Simple** - Easy to understand and debug
3. **Portable** - Standard format, readable by any tool
4. **Fast Enough** - Perfect for personal use (thousands of items)
5. **Vite-Friendly** - Bundles perfectly with modern tools

### Performance
- **Load time**: < 100ms for typical database size
- **Save time**: < 50ms
- **Search**: Linear search is fast enough for personal use
- **Scalability**: Works well with thousands of notes/clipboard items

## Troubleshooting

### Database corrupted?
1. Close the app
2. Rename `clipmaster.json` to `clipmaster.json.backup`
3. Restart the app (creates a fresh database)
4. Run migration script if needed

### Want to reset everything?
Delete the `clipmaster.json` file and restart the app.

### Manual editing?
Yes! The JSON file is human-readable. You can edit it with any text editor (while the app is closed).

---

**Last Updated**: November 16, 2024  
**Database Version**: 1.0  
**Format**: JSON

