# Quick Start: Building Your Installer 🚀

## TL;DR - Just Build It

```bash
npm run make
```

Installer will be at: `out/make/squirrel.windows/x64/ClipMaster-Setup.exe`

---

## Configuring Uninstall Behavior

Open `installer/uninstall-cleanup.js` and edit:

```javascript
const CONFIG = {
  REMOVE_USER_DATA: false,  // Change to true to delete data on uninstall
};
```

### Options:
- `false` ✅ **Recommended** - Keeps user data (notes, clipboard history)
- `true` - Deletes everything on uninstall

---

## Full Build Process

### 1. Package the App
```bash
npm run package
```
Creates packaged app in `out/ClipMaster-win32-x64/`

### 2. Create Installer
```bash
npm run make
```
Creates installer in `out/make/squirrel.windows/x64/`

### 3. Distribute
Share `ClipMaster-Setup.exe` with users!

---

## What Gets Created

```
out/
└── make/
    └── squirrel.windows/
        └── x64/
            ├── ClipMaster-Setup.exe      ← Distribute this!
            ├── ClipMaster-1.0.0-full.nupkg
            └── RELEASES
```

---

## Installation Features

✅ Desktop shortcut  
✅ Start Menu shortcut  
✅ Auto-start on Windows boot  
✅ Automatic updates support (Squirrel)  
✅ Proper uninstall with data management  

---

## Testing Your Installer

1. **Build:** `npm run make`
2. **Install:** Run `ClipMaster-Setup.exe`
3. **Test:** Create notes, use clipboard
4. **Uninstall:** Windows Settings → Apps → ClipMaster
5. **Verify:** Check if `%APPDATA%\ClipMaster` exists based on your config

---

## Troubleshooting

### "node-gyp failed" Error
✅ Already fixed! We use `sql.js` (no native compilation needed)

### Installer Size Too Large
The installer is ~150-200MB due to Electron + Chromium. This is normal.

### Want Smaller Installer?
Consider:
- Remove unused dependencies
- Use `asar` packing (already enabled)
- Externalize large files

---

## Next Steps

1. ✅ Configure uninstall behavior (`installer/uninstall-cleanup.js`)
2. 🎨 Add app icon (`assets/icon.ico`)
3. 🚀 Build installer (`npm run make`)
4. 📦 Distribute to users!

