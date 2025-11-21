# Windows Context Menu Integration

This folder contains registry files to add ClipMaster to the Windows right-click context menu.

## Installation

1. **Install Context Menu Entry:**
   - Right-click `install-context-menu.reg`
   - Click "Merge" or "Yes" to add the registry entry
   - You may need administrator privileges

2. **After Installation:**
   - Right-click anywhere in File Explorer (on the background, not on a file)
   - You'll see "Create New Note in ClipMaster" in the context menu
   - Clicking it will open ClipMaster and create a new note

## Uninstallation

To remove the context menu entry:
- Right-click `uninstall-context-menu.reg`
- Click "Merge" or "Yes" to remove the registry entry

## Notes

- The registry files assume ClipMaster is installed in `C:\Program Files\ClipMaster\`
- If installed elsewhere, edit the `.reg` files and update the path
- The context menu entry only appears when right-clicking on the background in File Explorer
- If ClipMaster is already running, it will focus the existing window and create a new note
