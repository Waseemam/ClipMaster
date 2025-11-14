# Assets Folder 🎨

Place your app icons and installer graphics here.

## Required Files

### Windows Icon
- **Filename:** `icon.ico`
- **Purpose:** App icon (taskbar, title bar, shortcuts)
- **Recommended Size:** 256x256px
- **Format:** .ico (multi-resolution)
- **Tools:** 
  - [Online ICO Converter](https://icoconvert.com/)
  - [GIMP](https://www.gimp.org/) (free)

### Optional: Installer Animation
- **Filename:** `install.gif`
- **Purpose:** Displayed during installation
- **Recommended Size:** 308x58px
- **Format:** .gif (animated)
- **Duration:** 2-5 seconds loop

## How to Create an Icon

### Option 1: From PNG/JPG
1. Create a 512x512px PNG image with your logo
2. Use [icoconvert.com](https://icoconvert.com/) to convert to .ico
3. Save as `icon.ico` in this folder

### Option 2: Using Figma/Photoshop
1. Design your icon at 512x512px
2. Export at multiple resolutions (16, 32, 48, 128, 256)
3. Use a tool to combine into .ico format

### Option 3: Free Icon Resources
- [Flaticon](https://www.flaticon.com/)
- [Icons8](https://icons8.com/)
- [The Noun Project](https://thenounproject.com/)

## Current Status

- [ ] `icon.ico` - **Not added yet** (app will use default Electron icon)
- [ ] `install.gif` - **Optional** (installer will show progress bar only)

## After Adding Icons

Rebuild your installer:
```bash
npm run make
```

The installer will automatically use your new icons!

---

**Note:** Without custom icons, the app works fine but uses the default Electron icon. Adding custom icons makes your app look professional.

