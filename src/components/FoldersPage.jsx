import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Trash2,
  Settings,
  FileText,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/localDb';
import { ContextMenu } from './ContextMenu';
import { FolderSettingsDialog } from './FolderSettingsDialog';
import { getNotesForDynamicFolder } from '@/lib/folderRules';

export function FoldersPage({ onSelectNote }) {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    titles: true,
    content: true,
    tags: true,
  });

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);

  // Folder settings dialog
  const [settingsDialog, setSettingsDialog] = useState({ isOpen: false, folder: null });

  // Drag and drop state
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [draggedNote, setDraggedNote] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foldersResponse, notesResponse] = await Promise.all([
        db.getFolders(),
        db.getNotes(),
      ]);

      if (foldersResponse.success) {
        setFolders(foldersResponse.data || []);
      }

      if (notesResponse.success) {
        setNotes(notesResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load folders and notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (folderData) => {
    try {
      const response = await db.createFolder(folderData);

      if (response.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleUpdateFolder = async (folderId, folderData) => {
    try {
      const response = await db.updateFolder(folderId, folderData);

      if (response.success) {
        await loadData();
      }
    } catch (error) {
      console.error('Failed to update folder:', error);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    const folder = folders.find((f) => f.id === folderId);
    const notesInFolder = notes.filter((n) => n.folder_id === folderId);

    if (
      !confirm(
        `Are you sure you want to delete "${folder?.name}"? ${
          notesInFolder.length > 0
            ? `This folder contains ${notesInFolder.length} note(s). Notes will be moved to "Unfiled".`
            : ''
        }`
      )
    ) {
      return;
    }

    try {
      // Move all notes in this folder to null (unfiled)
      for (const note of notesInFolder) {
        await db.updateNote(note.id, {
          ...note,
          folderId: null,
        });
      }

      // Delete the folder
      await db.deleteFolder(folderId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleFolderContextMenu = (e, folder) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      items: [
        {
          icon: <Settings className="w-4 h-4" />,
          label: 'Folder Settings',
          onClick: () => setSettingsDialog({ isOpen: true, folder }),
        },
        { separator: true },
        {
          icon: <Trash2 className="w-4 h-4" />,
          label: 'Delete Folder',
          danger: true,
          onClick: () => handleDeleteFolder(folder.id),
        },
      ],
    });
  };

  const handleEmptySpaceContextMenu = (e) => {
    e.preventDefault();

    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      items: [
        {
          icon: <FolderPlus className="w-4 h-4" />,
          label: 'New Folder',
          onClick: () => setSettingsDialog({ isOpen: true, folder: null }),
        },
      ],
    });
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const getNotesInFolder = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return [];

    // Use dynamic folder rules if applicable
    if (folder.type === 'dynamic' || folder.type === 'hybrid') {
      return getNotesForDynamicFolder(notes, folder);
    }

    // Manual folders: only return explicitly assigned notes
    return notes.filter((n) => n.folder_id === folderId);
  };

  const getUnfiledNotes = () => {
    return notes.filter((n) => !n.folder_id);
  };

  const filterNotes = (notesToFilter) => {
    if (!searchQuery.trim()) return notesToFilter;

    const query = searchQuery.toLowerCase();

    return notesToFilter.filter((note) => {
      if (searchFilters.titles && note.title?.toLowerCase().includes(query)) {
        return true;
      }
      if (searchFilters.content && note.content?.toLowerCase().includes(query)) {
        return true;
      }
      if (searchFilters.tags && note.tags?.some((tag) => tag.toLowerCase().includes(query))) {
        return true;
      }
      return false;
    });
  };

  const toggleSearchFilter = (filter) => {
    setSearchFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const handleDragOver = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't allow dropping into dynamic-only folders
    if (folderId !== null) {
      const folder = folders.find(f => f.id === folderId);
      if (folder && folder.type === 'dynamic') {
        e.dataTransfer.dropEffect = 'none';
        return;
      }
    }

    setDragOverFolder(folderId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
  };

  const handleDrop = async (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
    setDraggedNote(null);

    const noteId = e.dataTransfer.getData('text/plain');
    if (!noteId) return;

    try {
      const note = notes.find((n) => n.id === parseInt(noteId));
      if (!note) return;

      await db.updateNote(note.id, {
        ...note,
        folderId: folderId,
      });
      await loadData();
    } catch (error) {
      console.error('Failed to move note to folder:', error);
    }
  };

  const handleNoteDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', note.id);
  };

  const handleNoteDragEnd = () => {
    setDraggedNote(null);
  };

  const handleNoteContextMenu = (e, note) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      items: [
        {
          icon: <FileText className="w-4 h-4" />,
          label: 'Open Note',
          onClick: () => onSelectNote(note),
        },
        { separator: true },
        {
          icon: <Trash2 className="w-4 h-4" />,
          label: 'Delete Note',
          danger: true,
          onClick: async () => {
            if (!confirm(`Delete "${note.title || 'Untitled'}"?`)) return;
            try {
              await db.deleteNote(note.id);
              await loadData();
            } catch (error) {
              console.error('Failed to delete note:', error);
            }
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-app-bg-secondary">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-app-text-muted">Loading folders...</p>
        </div>
      </div>
    );
  }

  const unfiledNotes = filterNotes(getUnfiledNotes());

  return (
    <div
      className="flex-1 flex flex-col h-full bg-app-bg-secondary"
      onContextMenu={handleEmptySpaceContextMenu}
    >
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-6 bg-app-bg-secondary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-app-text-primary">Folders</h1>
            <p className="text-sm text-app-text-muted mt-1">
              {folders.length} folders • {notes.length} total notes
            </p>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-app-text-muted" />
            <Input
              type="text"
              placeholder="Search notes by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-input border-input-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-app-text-muted hover:text-app-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Filters */}
          <div className="flex gap-2 items-center">
            <span className="text-xs text-app-text-muted">Filter by:</span>
            <Button
              variant={searchFilters.titles ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSearchFilter('titles')}
              className="h-7 text-xs"
            >
              Titles
            </Button>
            <Button
              variant={searchFilters.content ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSearchFilter('content')}
              className="h-7 text-xs"
            >
              Content
            </Button>
            <Button
              variant={searchFilters.tags ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSearchFilter('tags')}
              className="h-7 text-xs"
            >
              Tags
            </Button>
          </div>
        </div>
      </div>

      {/* Folders List */}
      <ScrollArea className="flex-1">
        <div className="px-8 py-4 space-y-2">
          {folders.length === 0 && unfiledNotes.length === 0 ? (
            <div className="text-center py-16">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-20 text-app-text-muted" />
              <p className="text-app-text-muted">No folders yet</p>
              <p className="text-sm text-app-text-muted mt-2">
                Right-click to create a folder
              </p>
            </div>
          ) : (
            <>
              {/* Folders */}
              {folders.map((folder) => {
                const folderNotes = filterNotes(getNotesInFolder(folder.id));
                const isExpanded = expandedFolders.has(folder.id);

                return (
                  <div key={folder.id} className="space-y-1">
                    {/* Folder Header */}
                    <div
                      className={`group flex items-center gap-2 p-3 rounded-lg bg-app-bg-primary border transition-all ${
                        dragOverFolder === folder.id
                          ? 'border-primary border-2 bg-primary/10'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                      onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                      onDragOver={(e) => handleDragOver(e, folder.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, folder.id)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => toggleFolder(folder.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>

                      {isExpanded ? (
                        <FolderOpen
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: folder.color || '#3b82f6' }}
                        />
                      ) : (
                        <Folder
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: folder.color || '#3b82f6' }}
                        />
                      )}

                      <span className="flex-1 font-semibold text-app-text-primary truncate">
                        {folder.name}
                      </span>

                      {folder.type === 'dynamic' && (
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                      )}

                      <Badge variant="secondary" className="flex-shrink-0">
                        {folderNotes.length}
                      </Badge>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSettingsDialog({ isOpen: true, folder })}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Notes in Folder */}
                    {isExpanded && (
                      <div className="ml-10 space-y-1">
                        {folderNotes.length === 0 ? (
                          <div className="p-4 text-sm text-app-text-muted italic">
                            {searchQuery ? 'No notes match your search' : 'No notes in this folder'}
                          </div>
                        ) : (
                          folderNotes.map((note) => (
                            <div
                              key={note.id}
                              draggable
                              onDragStart={(e) => handleNoteDragStart(e, note)}
                              onDragEnd={handleNoteDragEnd}
                              onClick={() => onSelectNote(note)}
                              onContextMenu={(e) => handleNoteContextMenu(e, note)}
                              className={`group flex items-center gap-2 p-3 rounded-lg bg-app-bg-tertiary hover:bg-app-bg-primary border border-transparent hover:border-primary/50 transition-all cursor-pointer ${
                                draggedNote?.id === note.id ? 'opacity-50' : ''
                              }`}
                            >
                              <FileText className="w-4 h-4 text-app-text-secondary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-app-text-primary truncate">
                                  {note.title || 'Untitled'}
                                </p>
                                <p className="text-xs text-app-text-muted">
                                  {new Date(
                                    note.updated_at || note.updatedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {note.tags && note.tags.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {note.tags[0]}
                                </Badge>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unfiled Notes */}
              {unfiledNotes.length > 0 && (
                <div className="space-y-1 mt-4">
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg bg-app-bg-primary border transition-all ${
                      dragOverFolder === null && dragOverFolder !== undefined
                        ? 'border-primary border-2 bg-primary/10'
                        : 'border-border/50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, null)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, null)}
                  >
                    <Folder className="w-5 h-5 text-app-text-muted flex-shrink-0" />
                    <span className="flex-1 font-semibold text-app-text-secondary">
                      Unfiled Notes
                    </span>
                    <Badge variant="secondary">{unfiledNotes.length}</Badge>
                  </div>

                  <div className="ml-10 space-y-1">
                    {unfiledNotes.map((note) => (
                      <div
                        key={note.id}
                        draggable
                        onDragStart={(e) => handleNoteDragStart(e, note)}
                        onDragEnd={handleNoteDragEnd}
                        onClick={() => onSelectNote(note)}
                        onContextMenu={(e) => handleNoteContextMenu(e, note)}
                        className={`group flex items-center gap-2 p-3 rounded-lg bg-app-bg-tertiary hover:bg-app-bg-primary border border-transparent hover:border-primary/50 transition-all cursor-pointer ${
                          draggedNote?.id === note.id ? 'opacity-50' : ''
                        }`}
                      >
                        <FileText className="w-4 h-4 text-app-text-secondary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-app-text-primary truncate">
                            {note.title || 'Untitled'}
                          </p>
                          <p className="text-xs text-app-text-muted">
                            {new Date(
                              note.updated_at || note.updatedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {note.tags && note.tags.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {note.tags[0]}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Folder Settings Dialog */}
      {settingsDialog.isOpen && (
        <FolderSettingsDialog
          folder={settingsDialog.folder}
          isOpen={settingsDialog.isOpen}
          onClose={() => setSettingsDialog({ isOpen: false, folder: null })}
          onSave={(folderData) => {
            if (settingsDialog.folder) {
              handleUpdateFolder(settingsDialog.folder.id, folderData);
            } else {
              handleCreateFolder(folderData);
            }
            setSettingsDialog({ isOpen: false, folder: null });
          }}
        />
      )}
    </div>
  );
}
