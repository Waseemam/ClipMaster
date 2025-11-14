// Local Database API Client
// Uses Electron IPC to communicate with the SQLite database in the main process
// All data is stored locally in: C:\Users\[username]\AppData\Local\ClipMaster\

class LocalDatabaseClient {
  constructor() {
    // Check if we're in Electron environment
    if (!window.electronAPI || !window.electronAPI.db) {
      console.warn('Electron API not available. Database operations will fail.');
    }
  }

  // Notes API
  async getNotes(params = {}) {
    try {
      return await window.electronAPI.db.notes.getAll(params);
    } catch (error) {
      console.error('Failed to get notes:', error);
      return { success: false, error: error.message };
    }
  }

  async getNote(id) {
    try {
      return await window.electronAPI.db.notes.getById(id);
    } catch (error) {
      console.error('Failed to get note:', error);
      return { success: false, error: error.message };
    }
  }

  async createNote(noteData) {
    try {
      return await window.electronAPI.db.notes.create(noteData);
    } catch (error) {
      console.error('Failed to create note:', error);
      return { success: false, error: error.message };
    }
  }

  async updateNote(id, noteData) {
    try {
      return await window.electronAPI.db.notes.update(id, noteData);
    } catch (error) {
      console.error('Failed to update note:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteNote(id) {
    try {
      return await window.electronAPI.db.notes.delete(id);
    } catch (error) {
      console.error('Failed to delete note:', error);
      return { success: false, error: error.message };
    }
  }

  // Clipboard API
  async getClipboardHistory(params = {}) {
    try {
      return await window.electronAPI.db.clipboard.getAll(params);
    } catch (error) {
      console.error('Failed to get clipboard history:', error);
      return { success: false, error: error.message };
    }
  }

  async saveClipboardItem(itemData) {
    try {
      return await window.electronAPI.db.clipboard.create(itemData);
    } catch (error) {
      console.error('Failed to save clipboard item:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteClipboardItem(id) {
    try {
      return await window.electronAPI.db.clipboard.delete(id);
    } catch (error) {
      console.error('Failed to delete clipboard item:', error);
      return { success: false, error: error.message };
    }
  }

  async clearClipboardHistory() {
    try {
      return await window.electronAPI.db.clipboard.clear();
    } catch (error) {
      console.error('Failed to clear clipboard history:', error);
      return { success: false, error: error.message };
    }
  }

  // Folders API
  async getFolders() {
    try {
      return await window.electronAPI.db.folders.getAll();
    } catch (error) {
      console.error('Failed to get folders:', error);
      return { success: false, error: error.message };
    }
  }

  async createFolder(folderData) {
    try {
      return await window.electronAPI.db.folders.create(folderData);
    } catch (error) {
      console.error('Failed to create folder:', error);
      return { success: false, error: error.message };
    }
  }

  // Tags API
  async getTags() {
    try {
      return await window.electronAPI.db.tags.getAll();
    } catch (error) {
      console.error('Failed to get tags:', error);
      return { success: false, error: error.message };
    }
  }

  // Search API
  async search(query) {
    try {
      return await window.electronAPI.db.notes.search(query);
    } catch (error) {
      console.error('Failed to search:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility function to get database path (for debugging)
  async getDatabasePath() {
    try {
      return await window.electronAPI.db.getPath();
    } catch (error) {
      console.error('Failed to get database path:', error);
      return { success: false, error: error.message };
    }
  }
}

export const api = new LocalDatabaseClient();

