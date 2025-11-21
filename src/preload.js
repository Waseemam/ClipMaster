// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer, webUtils } = require('electron');

// Expose window controls and clipboard to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  onMaximizeChange: (callback) => ipcRenderer.on('window-maximized', callback),
  onUnmaximizeChange: (callback) => ipcRenderer.on('window-unmaximized', callback),

  // System Tray Context Menu API
  onContextMenuNewNote: (callback) => {
    ipcRenderer.on('context-menu-new-note', callback);
  },
  removeContextMenuListener: () => {
    ipcRenderer.removeAllListeners('context-menu-new-note');
  },

  // Auto-updater API
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, version) => callback(version));
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, percent) => callback(percent));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (event, version) => callback(version));
  },
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
  },

  // Clipboard API
  startClipboardMonitoring: () => ipcRenderer.send('start-clipboard-monitoring'),
  stopClipboardMonitoring: () => ipcRenderer.send('stop-clipboard-monitoring'),
  onClipboardChange: (callback) => {
    ipcRenderer.on('clipboard-change', (event, data) => callback(data));
  },
  removeClipboardListener: () => {
    ipcRenderer.removeAllListeners('clipboard-change');
  },

  // Database API
  db: {
    // Notes
    getNotes: (params) => ipcRenderer.invoke('db:getNotes', params),
    getNote: (id) => ipcRenderer.invoke('db:getNote', id),
    createNote: (noteData) => ipcRenderer.invoke('db:createNote', noteData),
    updateNote: (id, noteData) => ipcRenderer.invoke('db:updateNote', id, noteData),
    deleteNote: (id) => ipcRenderer.invoke('db:deleteNote', id),

    // Folders
    getFolders: () => ipcRenderer.invoke('db:getFolders'),
    createFolder: (folderData) => ipcRenderer.invoke('db:createFolder', folderData),

    // Tags
    getTags: () => ipcRenderer.invoke('db:getTags'),

    // Clipboard
    getClipboardHistory: (params) => ipcRenderer.invoke('db:getClipboardHistory', params),
    saveClipboardItem: (itemData) => ipcRenderer.invoke('db:saveClipboardItem', itemData),
    deleteClipboardItem: (id) => ipcRenderer.invoke('db:deleteClipboardItem', id),
    clearClipboardHistory: () => ipcRenderer.invoke('db:clearClipboardHistory'),

    // Search
    search: (query) => ipcRenderer.invoke('db:search', query),
  },

  // Image API
  getPathForFile: (file) => webUtils.getPathForFile(file),
  saveImage: (filePath) => {
    console.log('[PRELOAD] saveImage called with:', filePath);
    return ipcRenderer.invoke('save-image', filePath);
  },
  saveImageFromClipboard: (base64Data) => {
    console.log('[PRELOAD] saveImageFromClipboard called');
    return ipcRenderer.invoke('save-image-from-clipboard', base64Data);
  },
  cleanupImages: () => ipcRenderer.invoke('cleanup-images'),

  // Context Menu API
  installContextMenu: () => ipcRenderer.invoke('install-context-menu'),
  uninstallContextMenu: () => ipcRenderer.invoke('uninstall-context-menu'),
});
