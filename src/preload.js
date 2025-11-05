// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// Expose window controls and clipboard to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  onMaximizeChange: (callback) => ipcRenderer.on('window-maximized', callback),
  onUnmaximizeChange: (callback) => ipcRenderer.on('window-unmaximized', callback),
  
  // Clipboard API
  startClipboardMonitoring: () => ipcRenderer.send('start-clipboard-monitoring'),
  stopClipboardMonitoring: () => ipcRenderer.send('stop-clipboard-monitoring'),
  onClipboardChange: (callback) => {
    ipcRenderer.on('clipboard-change', (event, data) => callback(data));
  },
  removeClipboardListener: () => {
    ipcRenderer.removeAllListeners('clipboard-change');
  },
});
