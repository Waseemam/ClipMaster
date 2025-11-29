# Automated Release Guide

## Quick Release

To create a new release, simply run:

```powershell
.\release.ps1
```

Or with a custom commit message:

```powershell
.\release.ps1 -CommitMessage "Added new feature X"
```

## What the Script Does

The `release.ps1` script automates the entire release process:

1. **Reads version** from `package.json`
2. **Commits changes** to git with your message
3. **Pushes to GitHub** (AmmarWorking branch)
4. **Builds the app** using `npm run dist:win`
5. **Creates GitHub release** with tag `v{version}`
6. **Uploads files**:
   - `ClipMaster-Setup-{version}.exe`
   - `ClipMaster-Setup-{version}.exe.blockmap`
   - `latest.yml`
7. **Uses release notes** from `RELEASE_NOTES.md` if it exists

## Release Notes (Optional)

If you want custom release notes, create a `RELEASE_NOTES.md` file in the root directory with your notes. The script will automatically use it.

If `RELEASE_NOTES.md` doesn't exist, GitHub will auto-generate notes from commits.

## Before Running

1. Update version in `package.json`
2. (Optional) Create `RELEASE_NOTES.md` with your release notes
3. Make sure all your changes are ready to commit
4. Run `.\release.ps1`

## Example Workflow

```powershell
# 1. Update version in package.json to 1.3.7
# 2. Create RELEASE_NOTES.md (optional)
# 3. Run release script
.\release.ps1 -CommitMessage "v1.3.7: Added awesome new feature"
```

That's it! The script handles everything else automatically.

## Troubleshooting

- **"gh not found"**: Make sure GitHub CLI is installed and authenticated
- **Build fails**: Check that `npm run dist:win` works manually
- **Push fails**: Make sure you have push access to the repository
