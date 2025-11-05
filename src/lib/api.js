// API client for ClipFlow Server
const API_BASE_URL = 'http://ammarserver:3001/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Notes API
  async getNotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/notes?${queryString}` : '/notes';
    return this.request(endpoint);
  }

  async getNote(id) {
    return this.request(`/notes/${id}`);
  }

  async createNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(id, noteData) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Clipboard API
  async getClipboardHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/clipboard?${queryString}` : '/clipboard';
    return this.request(endpoint);
  }

  async saveClipboardItem(itemData) {
    return this.request('/clipboard', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async deleteClipboardItem(id) {
    return this.request(`/clipboard/${id}`, {
      method: 'DELETE',
    });
  }

  async clearClipboardHistory() {
    return this.request('/clipboard/clear', {
      method: 'DELETE',
    });
  }

  // Folders API
  async getFolders() {
    return this.request('/folders');
  }

  async createFolder(folderData) {
    return this.request('/folders', {
      method: 'POST',
      body: JSON.stringify(folderData),
    });
  }

  // Tags API
  async getTags() {
    return this.request('/tags');
  }

  // Search API
  async search(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiClient();

