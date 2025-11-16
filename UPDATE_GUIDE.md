# ClipMaster Auto-Update Guide 🚀

## How Auto-Updates Work

When you publish a new version of ClipMaster:
1. Your friends' apps will **automatically check for updates** when they open ClipMaster
2. They'll see a **blue banner** saying "New version available!"
3. They click **"Download"** - the update downloads in the background
4. Once downloaded, a **green banner** appears saying "Update ready!"
5. They click **"Restart Now"** - ClipMaster closes and installs the update automatically
6. App reopens with the new version! ✨

---

## How to Publish an Update

### Step 1: Update the Version Number

Edit `package.json` and increment the version:
```json
"version": "1.2.0",  // Change from 1.1.0 to 1.2.0
```

**Version Numbering Guide:**
- **1.0.0 → 1.0.1** - Bug fixes (patch)
- **1.0.0 → 1.1.0** - New features (minor)
- **1.0.0 → 2.0.0** - Breaking changes (major)

### Step 2: Build the New Version

Run the build command:
```bash
npm run dist:win
```

This creates:
- `dist/ClipMaster Setup 1.2.0.exe` (installer)
- `dist/latest.yml` (update metadata)
- `dist/ClipMaster Setup 1.2.0.exe.blockmap` (update info)

### Step 3: Create a GitHub Release

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Release v1.2.0 - Added system tray icon"
   git push origin AmmarWorking
   ```

2. **Go to your GitHub repository:**
   - Visit: https://github.com/Waseemam/ClipMaster

3. **Create a new release:**
   - Click on "Releases" (right side)
   - Click "Create a new release"
   - Click "Choose a tag" → Type: `v1.2.0` → Click "Create new tag"
   - Release title: `v1.2.0`
   - Description: 
     ```
     ## What's New in v1.2.0
     
     ✨ System Tray Icon
     - Right-click tray icon to create new notes instantly
     - Hide app to tray instead of closing
     - Quick access from taskbar
     
     🔄 Auto-Updates
     - App now updates itself automatically
     - No more manual downloads!
     ```

4. **Upload the files:**
   - Drag and drop these 3 files from the `dist/` folder:
     - `ClipMaster Setup 1.2.0.exe`
     - `latest.yml`
     - `ClipMaster Setup 1.2.0.exe.blockmap`

5. **Publish the release:**
   - Click "Publish release"

### Step 4: Done! 🎉

That's it! Within 3-10 seconds of opening ClipMaster, your friends will see:
- Blue banner: "🎉 New version 1.2.0 available!"
- They click "Download" → Progress shows
- Green banner: "✨ Update 1.2.0 is ready! Restart to install."
- They click "Restart Now" → App updates automatically!

---

## Publishing with Command Line (Alternative)

If you have a GitHub token, you can publish directly:

1. **Set your GitHub token:**
   ```bash
   # Windows PowerShell
   $env:GH_TOKEN="your_github_personal_access_token"
   ```

2. **Build and publish in one command:**
   ```bash
   npm run dist:win -- --publish always
   ```

**How to get a GitHub token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo` (full control)
4. Copy the token and save it securely

---

## Testing Updates Locally

To test if updates work before publishing:

1. **Build version 1.1.0:**
   ```bash
   npm run dist:win
   ```

2. **Install it** on your test machine

3. **Update version to 1.2.0** in `package.json`

4. **Build version 1.2.0:**
   ```bash
   npm run dist:win
   ```

5. **Create a GitHub release** with v1.2.0 files

6. **Open the installed 1.1.0 app** - it should detect and offer the update!

---

## Troubleshooting

### "Update not detected"
- Make sure version numbers follow semantic versioning (1.0.0, 1.1.0, etc.)
- Ensure `latest.yml` is uploaded to GitHub Release
- Check that release is published (not draft)
- Wait 3-10 seconds after opening the app

### "Download fails"
- Make sure all 3 files are uploaded (exe, yml, blockmap)
- Check internet connection
- Verify GitHub release is public

### "Manual update needed"
If auto-update fails, users can always:
1. Download the new installer from GitHub Releases
2. Run it - it will update the existing installation
3. All data is preserved!

---

## Current Version: 1.1.0

**New Features:**
- ✨ System tray icon with right-click menu
- 📝 Quick "Create New Note" from tray
- 🔄 Automatic update system
- 🎯 Hide to tray instead of closing

**Coming Soon:**
- Customize your plans here!

---

## Questions?

- **Repository:** https://github.com/Waseemam/ClipMaster
- **Create Release:** https://github.com/Waseemam/ClipMaster/releases/new
- **View Releases:** https://github.com/Waseemam/ClipMaster/releases

Happy updating! 🚀

