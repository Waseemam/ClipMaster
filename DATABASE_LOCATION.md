# Database Storage Location 📍

## Current Location

Your ClipMaster database is now stored in the **standard Windows user data directory**:

```
C:\Users\ammar\AppData\Roaming\ClipMaster\clipmaster.db
```

## Why This Location?

✅ **Persists across app updates** - Your data won't be lost when you update ClipMaster  
✅ **Standard Windows convention** - Same location used by major apps like VS Code, Discord, etc.  
✅ **No permission issues** - Writable without admin rights  
✅ **Automatic backups** - Many backup tools include AppData by default  

## Cross-Platform Support

The app automatically uses the correct location for each OS:

| Platform | Location |
|----------|----------|
| **Windows** | `C:\Users\[username]\AppData\Roaming\ClipMaster\clipmaster.db` |
| **macOS** | `~/Library/Application Support/ClipMaster/clipmaster.db` |
| **Linux** | `~/.config/ClipMaster/clipmaster.db` |

## How to Backup

Simply copy the `clipmaster.db` file from the location above!

**Quick Backup Command (Windows):**
```powershell
Copy-Item "$env:APPDATA\ClipMaster\clipmaster.db" "D:\Backups\clipmaster-backup.db"
```

## Migration Complete

✅ Your database has been copied from the old location to the new one  
✅ All 12 notes, 3 clipboard items, and 47 tags are preserved  
✅ You can safely delete the old `data/` folder from your project if you want  

## Finding Your Database

**Windows:** Press `Win+R`, type `%APPDATA%\ClipMaster` and press Enter

**Via ClipMaster:** The app logs the database path on startup - check the console!

