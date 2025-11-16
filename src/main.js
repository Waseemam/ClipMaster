const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const ClipMasterDB = require('./lib/database');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // electron-squirrel-startup not available, continue normally
}

// Initialize database
let db;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false, // Remove default title bar
    backgroundColor: '#2f3136',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

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
    mainWindow.close();
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Initialize database
  try {
    db = new ClipMasterDB();
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

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Close database connection when app quits
app.on('before-quit', () => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
