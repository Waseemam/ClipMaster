# Installer Configuration Guide 🔧

## Current Setup

ClipMaster now has a **configurable installer** that can handle user data during uninstallation.

## Files Created

### 1. `installer/uninstall-cleanup.js`
Main cleanup configuration file. **This is where you control uninstall behavior.**

### 2. `installer/setup-events.js`
Handles Squirrel.Windows installer events (install, update, uninstall).

## Configuration Options

Edit `installer/uninstall-cleanup.js` to change behavior:

```javascript
const CONFIG = {
  // Set to true to DELETE user data on uninstall
  // Set to false to KEEP user data (default, safer)
  REMOVE_USER_DATA: false,
  
  // If true, shows confirmation before deleting (future feature)
  CONFIRM_BEFORE_DELETE: true,
  
  // User data location
  USER_DATA_PATH: path.join(process.env.APPDATA, 'ClipMaster'),
};
```

## Behavior Options

### Option 1: Keep User Data (Current Default) ✅
**Best for most users - preserves data on uninstall/reinstall**

```javascript
REMOVE_USER_DATA: false
```

**Result:**
- ✅ Uninstall removes app files
- ✅ User data remains in `%APPDATA%\ClipMaster`
- ✅ Reinstalling restores all notes and clipboard history
- ⚠️ Users must manually delete `%APPDATA%\ClipMaster` for complete removal

### Option 2: Delete All Data on Uninstall
**Clean slate on uninstall - no traces left**

```javascript
REMOVE_USER_DATA: true
```

**Result:**
- ✅ Uninstall removes app files
- ✅ Uninstall deletes `%APPDATA%\ClipMaster`
- ❌ All notes, clipboard history, and settings are permanently deleted
- ⚠️ Cannot recover data after uninstall

## How to Change Behavior

1. Open `installer/uninstall-cleanup.js`
2. Find the `CONFIG` object at the top
3. Change `REMOVE_USER_DATA` to `true` or `false`
4. Rebuild the installer: `npm run make`

## Building the Installer

```bash
# Package the app
npm run package

# Create installer (includes uninstall scripts)
npm run make
```

Installer will be in: `out/make/squirrel.windows/x64/ClipMaster-Setup.exe`

## Testing Uninstall Behavior

1. Install using `ClipMaster-Setup.exe`
2. Create some test notes
3. Uninstall via Windows Settings → Apps
4. Check if `%APPDATA%\ClipMaster` exists:
   ```powershell
   Test-Path "$env:APPDATA\ClipMaster"
   ```

## Future Enhancements

### Add User Choice Dialog (Advanced)

You can enhance `uninstall-cleanup.js` to show a Windows dialog:

```javascript
// Pseudo-code for future implementation
if (CONFIG.CONFIRM_BEFORE_DELETE) {
  const userChoice = showDialog({
    message: 'Do you want to remove your notes and clipboard history?',
    buttons: ['Keep My Data', 'Delete Everything']
  });
  
  if (userChoice === 'Delete Everything') {
    deleteDirectory(CONFIG.USER_DATA_PATH);
  }
}
```

## Recommendation

**For public release:** Keep `REMOVE_USER_DATA: false` (current default)

**Reasons:**
- ✅ Users won't lose data by accident
- ✅ Can reinstall without data loss
- ✅ Standard behavior for most Windows apps
- ✅ Users who want complete removal can manually delete the folder

## User Documentation

Add to your README or Help section:

> **Uninstalling ClipMaster**
> 
> ClipMaster preserves your notes and clipboard history when uninstalled. This allows you to reinstall later without losing data.
> 
> To completely remove all data:
> 1. Uninstall ClipMaster normally
> 2. Delete: `%APPDATA%\ClipMaster`
> 
> Or run in PowerShell:
> ```powershell
> Remove-Item "$env:APPDATA\ClipMaster" -Recurse -Force
> ```

---

## Quick Reference

| Setting | Uninstall Behavior | Best For |
|---------|-------------------|----------|
| `REMOVE_USER_DATA: false` | Keeps data in AppData | **Most users (recommended)** |
| `REMOVE_USER_DATA: true` | Deletes everything | Privacy-focused builds |

**Current Setting:** `REMOVE_USER_DATA: false` ✅

