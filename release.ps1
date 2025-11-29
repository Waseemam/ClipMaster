# ClipMaster Automated Release Script
# This script automates the entire release process

param(
    [string]$CommitMessage = "Release update"
)

Write-Host "🚀 ClipMaster Automated Release Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Read version from package.json
Write-Host "📦 Reading version from package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version
Write-Host "   Version: v$version" -ForegroundColor Green
Write-Host ""

# Step 2: Git operations
Write-Host "📝 Committing changes..." -ForegroundColor Yellow
git add -A
git commit -m "$CommitMessage"
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  No changes to commit or commit failed" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git push origin AmmarWorking
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to push to GitHub" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Pushed successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run dist:win
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Build completed" -ForegroundColor Green
Write-Host ""

# Step 4: Prepare release files
$installerFile = "dist\ClipMaster-Setup-$version.exe"
$blockMapFile = "dist\ClipMaster-Setup-$version.exe.blockmap"
$latestYml = "dist\latest.yml"

Write-Host "📋 Checking release files..." -ForegroundColor Yellow
if (-not (Test-Path $installerFile)) {
    Write-Host "   ❌ Installer not found: $installerFile" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $blockMapFile)) {
    Write-Host "   ⚠️  Blockmap not found: $blockMapFile" -ForegroundColor Yellow
}
if (-not (Test-Path $latestYml)) {
    Write-Host "   ⚠️  latest.yml not found: $latestYml" -ForegroundColor Yellow
}
Write-Host "   ✓ Files ready" -ForegroundColor Green
Write-Host ""

# Step 5: Create GitHub release
Write-Host "🎉 Creating GitHub release v$version..." -ForegroundColor Yellow

# Check if release notes file exists
$releaseNotesFile = "RELEASE_NOTES.md"
$releaseNotesParam = ""
if (Test-Path $releaseNotesFile) {
    Write-Host "   Found RELEASE_NOTES.md" -ForegroundColor Green
    $releaseNotesParam = "--notes-file `"$releaseNotesFile`""
} else {
    Write-Host "   No RELEASE_NOTES.md found, using auto-generated notes" -ForegroundColor Yellow
    $releaseNotesParam = "--generate-notes"
}

# Create release with installer
$ghPath = "C:\Program Files\GitHub CLI\gh.exe"
$createCmd = "& `"$ghPath`" release create v$version `"$installerFile`" --title `"v$version`" $releaseNotesParam"
Invoke-Expression $createCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to create release" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Release created" -ForegroundColor Green
Write-Host ""

# Step 6: Upload additional files
Write-Host "📤 Uploading additional files..." -ForegroundColor Yellow
$filesToUpload = @()
if (Test-Path $blockMapFile) { $filesToUpload += $blockMapFile }
if (Test-Path $latestYml) { $filesToUpload += $latestYml }

if ($filesToUpload.Count -gt 0) {
    $uploadFiles = $filesToUpload -join '" "'
    $uploadCmd = "& `"$ghPath`" release upload v$version `"$uploadFiles`""
    Invoke-Expression $uploadCmd
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️  Failed to upload some files" -ForegroundColor Yellow
    } else {
        Write-Host "   ✓ Uploaded $($filesToUpload.Count) additional file(s)" -ForegroundColor Green
    }
} else {
    Write-Host "   No additional files to upload" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Summary
Write-Host "✅ Release Complete!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "Version: v$version" -ForegroundColor Cyan
Write-Host "URL: https://github.com/Waseemam/ClipMaster/releases/tag/v$version" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files uploaded:" -ForegroundColor Yellow
Write-Host "  - $installerFile" -ForegroundColor White
foreach ($file in $filesToUpload) {
    Write-Host "  - $file" -ForegroundColor White
}
Write-Host ""
