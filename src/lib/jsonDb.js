import fs from 'fs';
import path from 'path';
import { app } from 'electron';

class JsonDatabase {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Store database in user data directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'clipmaster.json');
    
    console.log('Database path:', this.dbPath);

    // Load existing database or create new one
    if (fs.existsSync(this.dbPath)) {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      this.db = JSON.parse(data);
      console.log('Loaded existing database');
    } else {
      this.db = {
        notes: [],
        clipboard_history: [],
        folders: [],
        tags: [],
        nextId: {
          notes: 1,
          clipboard: 1,
          folders: 1,
          tags: 1
        }
      };
      this.save();
      console.log('Created new database');
    }
    
    this.initialized = true;
  }

  save() {
    if (!this.db || !this.dbPath) return;
    fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), 'utf8');
  }

  // ==================== NOTES ====================
  
  getNotes(params = {}) {
    let notes = [...this.db.notes];
    
    if (params.folderId) {
      notes = notes.filter(n => n.folder_id === params.folderId);
    }
    
    if (params.search) {
      const search = params.search.toLowerCase();
      notes = notes.filter(n => 
        n.title.toLowerCase().includes(search) || 
        n.content.toLowerCase().includes(search)
      );
    }
    
    // Sort by updated_at desc
    notes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    
    if (params.limit) {
      notes = notes.slice(0, parseInt(params.limit));
    }
    
    return notes;
  }

  getNote(id) {
    return this.db.notes.find(n => n.id === id) || null;
  }

  createNote(noteData) {
    const { title, content, folderId, tags } = noteData;
    
    const note = {
      id: this.db.nextId.notes++,
      title,
      content,
      folder_id: folderId || null,
      tags: tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.db.notes.push(note);
    this.save();
    
    return note;
  }

  updateNote(id, noteData) {
    const { title, content, folderId, tags } = noteData;
    const note = this.db.notes.find(n => n.id === id);
    
    if (!note) return null;
    
    note.title = title;
    note.content = content;
    note.folder_id = folderId || null;
    if (tags !== undefined) {
      note.tags = tags;
    }
    note.updated_at = new Date().toISOString();
    
    this.save();
    return note;
  }

  deleteNote(id) {
    const index = this.db.notes.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    this.db.notes.splice(index, 1);
    this.save();
    return true;
  }

  // ==================== TAGS ====================
  
  getTags() {
    // Collect all unique tags from notes
    const tagSet = new Set();
    this.db.notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet).map(name => ({
      id: name,
      name,
      usage_count: this.db.notes.filter(n => n.tags && n.tags.includes(name)).length
    }));
  }

  // ==================== FOLDERS ====================
  
  getFolders() {
    return this.db.folders.map(f => ({
      ...f,
      note_count: this.db.notes.filter(n => n.folder_id === f.id).length
    }));
  }

  createFolder(folderData) {
    const { name, color, type, icon, rules, matchType } = folderData;

    const folder = {
      id: this.db.nextId.folders++,
      name,
      color: color || null,
      type: type || 'manual',
      icon: icon || 'folder',
      rules: rules || [],
      matchType: matchType || 'all',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.db.folders.push(folder);
    this.save();

    return folder;
  }

  updateFolder(id, folderData) {
    const { name, color, type, icon, rules, matchType } = folderData;
    const folder = this.db.folders.find(f => f.id === id);

    if (!folder) return null;

    if (name !== undefined) folder.name = name;
    if (color !== undefined) folder.color = color;
    if (type !== undefined) folder.type = type;
    if (icon !== undefined) folder.icon = icon;
    if (rules !== undefined) folder.rules = rules;
    if (matchType !== undefined) folder.matchType = matchType;
    folder.updated_at = new Date().toISOString();

    this.save();
    return folder;
  }

  deleteFolder(id) {
    const index = this.db.folders.findIndex(f => f.id === id);
    if (index === -1) return false;
    
    this.db.folders.splice(index, 1);
    this.save();
    return true;
  }

  // ==================== CLIPBOARD ====================
  
  getClipboardHistory(params = {}) {
    let items = [...this.db.clipboard_history];
    
    if (params.type) {
      items = items.filter(i => i.type === params.type);
    }
    
    if (params.search) {
      const search = params.search.toLowerCase();
      items = items.filter(i => 
        (i.title && i.title.toLowerCase().includes(search)) ||
        i.content.toLowerCase().includes(search)
      );
    }
    
    // Sort by created_at desc
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const limit = params.limit ? parseInt(params.limit) : 1000;
    return items.slice(0, limit);
  }

  saveClipboardItem(itemData) {
    const { content, type, title } = itemData;
    
    // Check for duplicate in recent history (last 50 items)
    const recent = this.db.clipboard_history.slice(0, 50);
    const duplicate = recent.find(i => i.content === content && i.type === type);
    
    if (duplicate) {
      // Update timestamp
      duplicate.created_at = new Date().toISOString();
      if (title) duplicate.title = title;
      this.save();
      return duplicate;
    }
    
    const item = {
      id: this.db.nextId.clipboard++,
      content,
      type,
      title: title || null,
      created_at: new Date().toISOString()
    };
    
    this.db.clipboard_history.unshift(item); // Add to beginning
    this.save();
    
    return item;
  }

  deleteClipboardItem(id) {
    const index = this.db.clipboard_history.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    this.db.clipboard_history.splice(index, 1);
    this.save();
    return true;
  }

  clearClipboardHistory() {
    const count = this.db.clipboard_history.length;
    this.db.clipboard_history = [];
    this.save();
    return count;
  }

  // ==================== SEARCH ====================
  
  search(query) {
    const searchTerm = query.toLowerCase();
    const results = [];
    
    // Search notes
    this.db.notes.forEach(note => {
      if (note.title.toLowerCase().includes(searchTerm) || 
          note.content.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'note',
          id: note.id,
          name: note.title,
          preview: note.content.substring(0, 100),
          created_at: note.created_at
        });
      }
    });
    
    // Search clipboard
    this.db.clipboard_history.slice(0, 100).forEach(item => {
      if ((item.title && item.title.toLowerCase().includes(searchTerm)) ||
          item.content.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'clipboard',
          id: item.id,
          name: item.title || item.content.substring(0, 50),
          preview: item.content.substring(0, 100),
          created_at: item.created_at
        });
      }
    });
    
    return results.slice(0, 50);
  }

  // ==================== UTILITY ====================
  
  close() {
    if (this.db) {
      this.save();
    }
  }
}

export default JsonDatabase;

