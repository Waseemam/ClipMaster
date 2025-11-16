// Local Database Client - Replaces API calls with local SQLite database
// This provides the same interface as the old API client but uses the local database

class LocalDbClient {
  // Notes API
  async getNotes(params = {}) {
    return window.electronAPI.db.getNotes(params);
  }

  async getNote(id) {
    return window.electronAPI.db.getNote(id);
  }

  async createNote(noteData) {
    return window.electronAPI.db.createNote(noteData);
  }

  async updateNote(id, noteData) {
    return window.electronAPI.db.updateNote(id, noteData);
  }

  async deleteNote(id) {
    return window.electronAPI.db.deleteNote(id);
  }

  // Clipboard API
  async getClipboardHistory(params = {}) {
    return window.electronAPI.db.getClipboardHistory(params);
  }

  async saveClipboardItem(itemData) {
    return window.electronAPI.db.saveClipboardItem(itemData);
  }

  async deleteClipboardItem(id) {
    return window.electronAPI.db.deleteClipboardItem(id);
  }

  async clearClipboardHistory() {
    return window.electronAPI.db.clearClipboardHistory();
  }

  // Folders API
  async getFolders() {
    return window.electronAPI.db.getFolders();
  }

  async createFolder(folderData) {
    return window.electronAPI.db.createFolder(folderData);
  }

  // Tags API
  async getTags() {
    return window.electronAPI.db.getTags();
  }

  // Search API
  async search(query) {
    return window.electronAPI.db.search(query);
  }
}

export const db = new LocalDbClient();

