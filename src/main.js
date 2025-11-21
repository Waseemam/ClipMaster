import { app, BrowserWindow, ipcMain, clipboard, Menu, Tray, nativeImage, protocol } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs';
import JsonDatabase from './lib/jsonDb.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
import squirrelStartup from 'electron-squirrel-startup';
if (squirrelStartup) {
  app.quit();
}

// Initialize database
let db;
let tray = null;
let mainWindow = null;

// Configure auto-updater
autoUpdater.autoDownload = false; // Don't auto-download, ask user first
autoUpdater.autoInstallOnAppQuit = true; // Install update when app quits

// Public repo - no token needed!
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'Waseemam',
  repo: 'ClipMaster'
});

const createTray = () => {
  // Create tray icon - use different paths for dev vs production
  let iconPath;
  if (process.env.VITE_DEV_SERVER_URL) {
    // Development mode
    iconPath = path.join(__dirname, '../build/icon.png');
  } else {
    // Production mode - icon is in extraResources/build/
    iconPath = path.join(process.resourcesPath, 'build', 'icon.png');
  }

  // Create icon from path and resize for system tray
  const icon = nativeImage.createFromPath(iconPath);

  // For Windows system tray, create a 16x16 icon
  const trayIcon = icon.resize({ width: 16, height: 16, quality: 'best' });

  tray = new Tray(trayIcon);
  tray.setToolTip('ClipMaster - Quick Notes & Clipboard Manager');

  // Create context menu for tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Create New Note',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('context-menu-new-note');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => {
        logToRenderer('[AUTO-UPDATER] Manual check triggered from tray menu');
        autoUpdater.checkForUpdates();
      }
    },
    { type: 'separator' },
    {
      label: 'Show ClipMaster',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Hide ClipMaster',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Double click to show/hide window
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false, // Remove default title bar
    backgroundColor: '#2f3136',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the index.html of the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open the DevTools only in development
  // mainWindow.webContents.openDevTools();

  // Window control handlers
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    // Hide window instead of closing it (keeps app in tray)
    mainWindow.hide();
  });

  // Notify renderer when window is maximized/unmaximized
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized');
  });

  // Clipboard monitoring
  let lastClipboardText = '';
  let lastClipboardImage = '';
  let clipboardInterval;

  const startClipboardMonitoring = () => {
    clipboardInterval = setInterval(() => {
      const text = clipboard.readText();
      const image = clipboard.readImage();

      // Check for text first (higher priority)
      if (text && text !== lastClipboardText && text.length > 0) {
        lastClipboardText = text;
        lastClipboardImage = ''; // Clear image tracking when text is copied
        mainWindow.webContents.send('clipboard-change', {
          type: 'text',
          content: text,
          timestamp: new Date().toISOString(),
        });
      }
      // Only check for images if there's no text or text hasn't changed
      else if (!image.isEmpty() && !text) {
        const imageData = image.toDataURL();
        // Only send if the image data is different from last time
        if (imageData !== lastClipboardImage) {
          lastClipboardImage = imageData;
          lastClipboardText = ''; // Clear text tracking when image is copied
          mainWindow.webContents.send('clipboard-change', {
            type: 'image',
            content: imageData,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }, 500); // Check every 500ms
  };

  const stopClipboardMonitoring = () => {
    if (clipboardInterval) {
      clearInterval(clipboardInterval);
    }
  };

  // IPC handlers for clipboard control
  ipcMain.on('start-clipboard-monitoring', () => {
    startClipboardMonitoring();
  });

  ipcMain.on('stop-clipboard-monitoring', () => {
    stopClipboardMonitoring();
  });

  // Start monitoring on app ready
  startClipboardMonitoring();

  // Stop monitoring when window is closed
  mainWindow.on('closed', () => {
    stopClipboardMonitoring();
  });

  // ==================== DATABASE IPC HANDLERS ====================

  // Notes
  ipcMain.handle('db:getNotes', async (event, params) => {
    try {
      const notes = db.getNotes(params);
      return { success: true, data: notes };
    } catch (error) {
      console.error('Get notes error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:getNote', async (event, id) => {
    try {
      const note = db.getNote(id);
      return { success: true, data: note };
    } catch (error) {
      console.error('Get note error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:createNote', async (event, noteData) => {
    try {
      const note = db.createNote(noteData);
      return { success: true, data: note };
    } catch (error) {
      console.error('Create note error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:updateNote', async (event, id, noteData) => {
    try {
      const note = db.updateNote(id, noteData);
      return { success: true, data: note };
    } catch (error) {
      console.error('Update note error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:deleteNote', async (event, id) => {
    try {
      const success = db.deleteNote(id);
      return { success, data: { deleted: success } };
    } catch (error) {
      console.error('Delete note error:', error);
      return { success: false, error: error.message };
    }
  });

  // Folders
  ipcMain.handle('db:getFolders', async () => {
    try {
      const folders = db.getFolders();
      return { success: true, data: folders };
    } catch (error) {
      console.error('Get folders error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:createFolder', async (event, folderData) => {
    try {
      const folder = db.createFolder(folderData);
      return { success: true, data: folder };
    } catch (error) {
      console.error('Create folder error:', error);
      return { success: false, error: error.message };
    }
  });

  // Tags
  ipcMain.handle('db:getTags', async () => {
    try {
      const tags = db.getTags();
      return { success: true, data: tags };
    } catch (error) {
      console.error('Get tags error:', error);
      return { success: false, error: error.message };
    }
  });

  // Clipboard
  ipcMain.handle('db:getClipboardHistory', async (event, params) => {
    try {
      const items = db.getClipboardHistory(params);
      return { success: true, data: { items } };
    } catch (error) {
      console.error('Get clipboard history error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:saveClipboardItem', async (event, itemData) => {
    try {
      const item = db.saveClipboardItem(itemData);
      return { success: true, data: item };
    } catch (error) {
      console.error('Save clipboard item error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:deleteClipboardItem', async (event, id) => {
    try {
      const success = db.deleteClipboardItem(id);
      return { success, data: { deleted: success } };
    } catch (error) {
      console.error('Delete clipboard item error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:clearClipboardHistory', async () => {
    try {
      const count = db.clearClipboardHistory();
      return { success: true, data: { count } };
    } catch (error) {
      console.error('Clear clipboard history error:', error);
      return { success: false, error: error.message };
    }
  });

  // Search
  ipcMain.handle('db:search', async (event, query) => {
    try {
      const results = db.search(query);
      return { success: true, data: results };
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, error: error.message };
    }
  });

  // ==================== IMAGE HANDLING ====================

  ipcMain.handle('save-image', async (event, filePath) => {
    console.log('[MAIN] save-image called with:', filePath);
    try {
      const userDataPath = app.getPath('userData');
      const imagesDir = path.join(userDataPath, 'images');

      // Create images directory if it doesn't exist
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Generate unique filename
      const ext = path.extname(filePath);
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const filename = `img_${timestamp}_${random}${ext}`;
      const destPath = path.join(imagesDir, filename);

      // Copy file
      fs.copyFileSync(filePath, destPath);

      return { success: true, filename };
    } catch (error) {
      console.error('Save image error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('cleanup-images', async () => {
    console.log('[MAIN] cleanup-images called');
    try {
      const userDataPath = app.getPath('userData');
      const imagesDir = path.join(userDataPath, 'images');

      if (!fs.existsSync(imagesDir)) {
        return { success: true, count: 0 };
      }

      // Get all notes
      const notes = db.getNotes();

      // Collect all used image filenames
      const usedImages = new Set();
      const regex = /local-resource:\/\/([^"\s)]+)/g;

      notes.forEach(note => {
        if (note.content) {
          let match;
          while ((match = regex.exec(note.content)) !== null) {
            usedImages.add(match[1]);
          }
        }
      });

      // Also check clipboard history if applicable (optional, but good practice)
      // const history = db.getClipboardHistory();
      // history.forEach(item => { ... });

      // List all files in images directory
      const files = fs.readdirSync(imagesDir);
      let deletedCount = 0;

      files.forEach(file => {
        if (!usedImages.has(file)) {
          const filePath = path.join(imagesDir, file);
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log('Deleted unused image:', file);
        }
      });

      return { success: true, count: deletedCount };
    } catch (error) {
      console.error('Cleanup images error:', error);
      return { success: false, error: error.message };
    }
  });
};

// ==================== AUTO-UPDATER ====================

// Helper to log to both console and renderer
const logToRenderer = (message, data = null) => {
  console.log(message, data || '');
  if (mainWindow && mainWindow.webContents) {
    const safeMessage = message.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    if (data) {
      mainWindow.webContents.executeJavaScript(`console.log('${safeMessage}', ${JSON.stringify(data)})`).catch(() => { });
    } else {
      mainWindow.webContents.executeJavaScript(`console.log('${safeMessage}')`).catch(() => { });
    }
  }
};

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  logToRenderer('[AUTO-UPDATER] Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  logToRenderer('[AUTO-UPDATER] ✅ Update available: ' + info.version);
  logToRenderer('[AUTO-UPDATER] Update info:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info.version);
  }

  // Show notification in tray
  if (tray) {
    tray.setToolTip(`ClipMaster - Update ${info.version} available!`);
  }
});

autoUpdater.on('update-not-available', (info) => {
  logToRenderer('[AUTO-UPDATER] ❌ No updates available');
  logToRenderer('[AUTO-UPDATER] Current version: ' + (info?.version || 'unknown'));
});

autoUpdater.on('error', (err) => {
  logToRenderer('[AUTO-UPDATER] ❌ ERROR: ' + err.message);
  console.error('[AUTO-UPDATER] Full error:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  const message = `Downloading: ${Math.round(progressObj.percent)}%`;
  console.log(message);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj.percent);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info.version);
  }

  // Show notification in tray
  if (tray) {
    tray.setToolTip('ClipMaster - Update ready to install!');
  }
});

// IPC handlers for update actions
ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Register custom protocol for local resources
  protocol.registerFileProtocol('local-resource', (request, callback) => {
    const url = request.url.replace('local-resource://', '');
    const decodedUrl = decodeURI(url); // Decode URL to handle spaces and special characters
    try {
      // The path should be relative to the images directory in userData
      const userDataPath = app.getPath('userData');
      const imagesDir = path.join(userDataPath, 'images');
      const filePath = path.join(imagesDir, decodedUrl);

      // Ensure we are not traversing out of the images directory (basic security)
      if (!filePath.startsWith(imagesDir)) {
        console.error('Access denied:', filePath);
        return callback({ error: -2 }); // FAILED
      }

      return callback(filePath);
    } catch (error) {
      console.error('Protocol error:', error);
      return callback({ error: -2 });
    }
  });

  // Initialize database
  try {
    db = new JsonDatabase();
    await db.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  // Enable auto-start on Windows startup
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: false, // Set to true if you want it to start minimized
    path: process.execPath,
    args: []
  });

  // Create system tray icon
  createTray();

  createWindow();

  // Check for updates after app is ready (wait 3 seconds)
  setTimeout(() => {
    if (!process.env.VITE_DEV_SERVER_URL) {
      // Only check for updates in production (not dev mode)
      logToRenderer('[AUTO-UPDATER] Starting update check...');
      logToRenderer('[AUTO-UPDATER] Repo: Waseemam/ClipMaster (public)');
      autoUpdater.checkForUpdates()
        .then(result => {
          logToRenderer('[AUTO-UPDATER] Check complete');
        })
        .catch(error => {
          logToRenderer('[AUTO-UPDATER] Check failed: ' + error.message);
        });
    } else {
      logToRenderer('[AUTO-UPDATER] Skipping update check (dev mode)');
    }
  }, 3000);

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Keep app running in tray when all windows are closed
app.on('window-all-closed', () => {
  // Don't quit the app - keep it running in system tray
  // User can quit from the tray menu
});

// Close database connection and cleanup when app quits
app.on('before-quit', () => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }

  // Destroy tray icon
  if (tray) {
    tray.destroy();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
