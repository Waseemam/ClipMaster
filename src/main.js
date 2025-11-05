const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
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
  let lastClipboard = '';
  let clipboardInterval;

  const startClipboardMonitoring = () => {
    clipboardInterval = setInterval(() => {
      const text = clipboard.readText();
      const image = clipboard.readImage();
      
      if (text && text !== lastClipboard && text.length > 0) {
        lastClipboard = text;
        mainWindow.webContents.send('clipboard-change', {
          type: 'text',
          content: text,
          timestamp: new Date().toISOString(),
        });
      } else if (!image.isEmpty() && clipboard.readText() !== lastClipboard) {
        // Handle images
        const imageData = image.toDataURL();
        lastClipboard = imageData;
        mainWindow.webContents.send('clipboard-change', {
          type: 'image',
          content: imageData,
          timestamp: new Date().toISOString(),
        });
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
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
