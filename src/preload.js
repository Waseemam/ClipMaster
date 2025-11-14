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

  // Database API
  db: {
    // Notes
    notes: {
      getAll: (params) => ipcRenderer.invoke('db:notes:getAll', params),
      getById: (id) => ipcRenderer.invoke('db:notes:getById', id),
      create: (noteData) => ipcRenderer.invoke('db:notes:create', noteData),
      update: (id, noteData) => ipcRenderer.invoke('db:notes:update', id, noteData),
      delete: (id) => ipcRenderer.invoke('db:notes:delete', id),
      search: (query) => ipcRenderer.invoke('db:notes:search', query),
    },
    // Clipboard
    clipboard: {
      getAll: (params) => ipcRenderer.invoke('db:clipboard:getAll', params),
      create: (itemData) => ipcRenderer.invoke('db:clipboard:create', itemData),
      delete: (id) => ipcRenderer.invoke('db:clipboard:delete', id),
      clear: () => ipcRenderer.invoke('db:clipboard:clear'),
    },
    // Folders
    folders: {
      getAll: () => ipcRenderer.invoke('db:folders:getAll'),
      create: (folderData) => ipcRenderer.invoke('db:folders:create', folderData),
    },
    // Tags
    tags: {
      getAll: () => ipcRenderer.invoke('db:tags:getAll'),
    },
    // Utility
    getPath: () => ipcRenderer.invoke('db:getPath'),
  },
});
