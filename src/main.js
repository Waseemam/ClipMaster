const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const { 
  initDatabase, 
  closeDatabase, 
  getDatabasePath,
  notesAPI, 
  clipboardAPI, 
  foldersAPI, 
  tagsAPI 
} = require('./database');

// Handle Squirrel.Windows installer events
if (process.platform === 'win32') {
  const setupEvents = require('../../installer/setup-events');
  if (setupEvents()) {
    // Installer event was handled, quit
    process.exit(0);
  }
}

// Fallback for electron-squirrel-startup
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // electron-squirrel-startup not available, continue normally
}

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

  // Open the DevTools. (Uncomment for development)
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

  // Database IPC Handlers
  
  // Notes handlers
  ipcMain.handle('db:notes:getAll', async (event, params) => {
    try {
      const notes = notesAPI.getAll(params);
      return { success: true, data: { notes } };
    } catch (error) {
      console.error('Error getting notes:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:getById', async (event, id) => {
    try {
      const note = notesAPI.getById(id);
      return { success: true, data: { note } };
    } catch (error) {
      console.error('Error getting note:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:create', async (event, noteData) => {
    try {
      const note = notesAPI.create(noteData);
      return { success: true, data: { note } };
    } catch (error) {
      console.error('Error creating note:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:update', async (event, id, noteData) => {
    try {
      const note = notesAPI.update(id, noteData);
      return { success: true, data: { note } };
    } catch (error) {
      console.error('Error updating note:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:delete', async (event, id) => {
    try {
      const success = notesAPI.delete(id);
      return { success, data: {} };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:search', async (event, query) => {
    try {
      const notes = notesAPI.search(query);
      return { success: true, data: { notes } };
    } catch (error) {
      console.error('Error searching notes:', error);
      return { success: false, error: error.message };
    }
  });

  // Clipboard handlers
  ipcMain.handle('db:clipboard:getAll', async (event, params) => {
    try {
      const items = clipboardAPI.getAll(params);
      return { success: true, data: { items } };
    } catch (error) {
      console.error('Error getting clipboard items:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:clipboard:create', async (event, itemData) => {
    try {
      const item = clipboardAPI.create(itemData);
      return { success: true, data: { item } };
    } catch (error) {
      console.error('Error creating clipboard item:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:clipboard:delete', async (event, id) => {
    try {
      const success = clipboardAPI.delete(id);
      return { success, data: {} };
    } catch (error) {
      console.error('Error deleting clipboard item:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:clipboard:clear', async () => {
    try {
      const deletedCount = clipboardAPI.clear();
      return { success: true, data: { deletedCount } };
    } catch (error) {
      console.error('Error clearing clipboard:', error);
      return { success: false, error: error.message };
    }
  });

  // Folders handlers
  ipcMain.handle('db:folders:getAll', async () => {
    try {
      const folders = foldersAPI.getAll();
      return { success: true, data: { folders } };
    } catch (error) {
      console.error('Error getting folders:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:folders:create', async (event, folderData) => {
    try {
      const folder = foldersAPI.create(folderData);
      return { success: true, data: { folder } };
    } catch (error) {
      console.error('Error creating folder:', error);
      return { success: false, error: error.message };
    }
  });

  // Tags handlers
  ipcMain.handle('db:tags:getAll', async () => {
    try {
      const tags = tagsAPI.getAll();
      return { success: true, data: { tags } };
    } catch (error) {
      console.error('Error getting tags:', error);
      return { success: false, error: error.message };
    }
  });

  // Get database path (for debugging/info)
  ipcMain.handle('db:getPath', async () => {
    try {
      const dbPath = getDatabasePath();
      return { success: true, data: { path: dbPath } };
    } catch (error) {
      console.error('Error getting database path:', error);
      return { success: false, error: error.message };
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Initialize database (async with sql.js)
  try {
    await initDatabase();
    console.log('Database initialized at:', getDatabasePath());
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
    closeDatabase();
    app.quit();
  }
});

// Clean up database on app quit
app.on('before-quit', () => {
  closeDatabase();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
