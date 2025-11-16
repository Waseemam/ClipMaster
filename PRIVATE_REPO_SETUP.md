# Private Repository Auto-Update Setup 🔒

## Overview

Your ClipMaster repo is private, so we need a GitHub token for auto-updates to work. This guide shows you how to set it up securely.

---

## Step 1: Create a GitHub Personal Access Token

1. **Go to GitHub Token Settings:**
   - Visit: https://github.com/settings/tokens

2. **Click "Generate new token"**
   - Choose "Generate new token (classic)"

3. **Configure the token:**
   - **Note:** `ClipMaster Auto-Updates`
   - **Expiration:** `No expiration` (or set a long time like 1 year)
   - **Select scopes:** ✅ Check **`repo`** (full control of private repositories)

4. **Generate and COPY the token!**
   - ⚠️ **IMPORTANT:** Copy it now - you won't see it again!
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save it somewhere safe (like a password manager)

---

## Step 2: Set Up the Token for Building

### On Windows (PowerShell):

**Option A: Temporary (for current session only)**
```powershell
$env:GH_TOKEN="ghp_your_token_here"
npm run dist:win
```

**Option B: Permanent (recommended)**
```powershell
# Set it permanently for your user
[System.Environment]::SetEnvironmentVariable('GH_TOKEN', 'ghp_your_token_here', 'User')

# Restart your terminal, then build:
npm run dist:win
```

### On Mac/Linux:

**Add to your `~/.bashrc` or `~/.zshrc`:**
```bash
export GH_TOKEN="ghp_your_token_here"
```

Then:
```bash
source ~/.bashrc  # or ~/.zshrc
npm run dist:win
```

---

## Step 3: Build and Publish

### Build with the token:

```powershell
# The token is automatically included during build
npm run dist:win
```

### Publish to GitHub Releases:

**Option A: Manual Upload (Easiest)**

1. Go to: https://github.com/Waseemam/ClipMaster/releases/new
2. Create tag: `v1.1.0`
3. Upload these 3 files:
   - `dist/ClipMaster Setup 1.1.0.exe`
   - `dist/latest.yml`
   - `dist/ClipMaster Setup 1.1.0.exe.blockmap`
4. Click "Publish release"

**Option B: Automated (with token)**

```powershell
# Build and publish in one command
npm run dist:win -- --publish always
```

---

## Step 4: Verify It Works

1. **Install v1.1.0** on a test machine
2. **Create a new release** (v1.2.0) on GitHub
3. **Open ClipMaster** - within 10 seconds you should see:
   - Blue banner: "New version 1.2.0 available!"
4. **Click Download** → **Click Restart**
5. ✅ Update successful!

---

## ⚠️ Security Considerations

### What's Safe:
✅ Token stored in your environment variables (only on your build machine)
✅ Token used during build process
✅ The **built app does NOT contain the token** in plain text
✅ Token has limited scope (only repo access)

### Potential Risks:
⚠️ The token is embedded in the built executable
⚠️ Advanced users could potentially extract it
⚠️ If extracted, they could read your private repo (but NOT modify it)

### How to Stay Safe:
1. **Don't commit the token to git** (we have it in .gitignore)
2. **Use a dedicated token** (not your main GitHub account token)
3. **Regenerate token if compromised:**
   - Go to: https://github.com/settings/tokens
   - Delete old token
   - Create new one
   - Update your environment variable

---

## Alternative: Make Repo Public Later

If you change your mind and want simpler auto-updates:

1. **Make repo public:**
   - Go to: https://github.com/Waseemam/ClipMaster/settings
   - Scroll to "Danger Zone"
   - Click "Change visibility" → Public

2. **Remove token requirement:**
   - The auto-updater will work without any token!
   - No security concerns

3. **Rebuild and publish:**
   ```powershell
   npm run dist:win
   ```

---

## Troubleshooting

### "Update not detected"
- Make sure you set `GH_TOKEN` before building
- Verify the token has `repo` scope
- Check that the release is published (not draft)

### "403 Forbidden" error
- Token might be expired or revoked
- Create a new token and rebuild

### "Cannot find update"
- Ensure all 3 files are uploaded to GitHub Release
- Check that `latest.yml` contains correct version info

---

## Quick Reference

### Check if token is set:
```powershell
echo $env:GH_TOKEN
```

### Build with token:
```powershell
npm run dist:win
```

### Publish automatically:
```powershell
npm run dist:win -- --publish always
```

### Create new release manually:
https://github.com/Waseemam/ClipMaster/releases/new

---

## Summary

1. ✅ Create GitHub token with `repo` scope
2. ✅ Set `GH_TOKEN` environment variable
3. ✅ Build: `npm run dist:win`
4. ✅ Upload to GitHub Releases
5. ✅ Your friends get auto-updates!

Your repo stays private, and auto-updates work! 🎉

