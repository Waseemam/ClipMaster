import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText, Clock, Folder, Tag, Trash2, Copy, FolderInput } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { db } from '@/lib/localDb';

// Helper function to extract plain text from HTML content
const getPlainTextPreview = (htmlContent, maxLength = 100) => {
  if (!htmlContent) return 'No content';

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Get text content (strips all HTML tags)
  const plainText = tempDiv.textContent || tempDiv.innerText || '';

  // Return trimmed text, limited to maxLength
  return plainText.trim().substring(0, maxLength) || 'No content';
};

export function Sidebar({ notes, currentNote, onNewNote, onSelectNote, onDeleteNote, onReloadNotes }) {
  const MIN_WIDTH = 200;
  const MAX_WIDTH = 600;
  const DEFAULT_WIDTH = 320;

  // Initialize from localStorage or default
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [folders, setFolders] = useState([]);
  const [draggedNote, setDraggedNote] = useState(null);

  // Load folders for context menu
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const response = await db.getFolders();
        if (response.success) {
          setFolders(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load folders:', error);
      }
    };
    loadFolders();
  }, []);

  const handleNoteContextMenu = (e, note) => {
    e.preventDefault();
    e.stopPropagation();

    const folderMenuItems = folders.map(folder => ({
      icon: <FolderInput className="w-4 h-4" />,
      label: `Move to ${folder.name}`,
      onClick: async () => {
        try {
          await db.updateNote(note.id, { ...note, folderId: folder.id });
          if (onReloadNotes) await onReloadNotes();
        } catch (error) {
          console.error('Failed to move note to folder:', error);
        }
      }
    }));

    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      items: [
        {
          icon: <Copy className="w-4 h-4" />,
          label: 'Duplicate Note',
          onClick: async () => {
            try {
              await db.createNote({
                title: `${note.title} (Copy)`,
                content: note.content,
                tags: note.tags || [],
                folderId: note.folder_id || note.folderId || null,
              });
              if (onReloadNotes) await onReloadNotes();
            } catch (error) {
              console.error('Failed to duplicate note:', error);
            }
          },
        },
        { separator: true },
        ...folderMenuItems,
        { separator: true },
        {
          icon: <Trash2 className="w-4 h-4" />,
          label: 'Delete Note',
          danger: true,
          onClick: () => {
            if (onDeleteNote) onDeleteNote(note.id);
          },
        },
      ],
    });
  };

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', note.id);
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
  };

  const startResizing = () => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
        // Save to localStorage
        localStorage.setItem('sidebarWidth', newWidth.toString());
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [isResizing]);

  return (
    <div 
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="border-r border-border/50 bg-app-bg-tertiary flex flex-col h-full relative flex-shrink-0"
    >
      {/* Resize Handle */}
      <div
        onMouseDown={startResizing}
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors ${
          isResizing ? 'bg-primary' : ''
        }`}
        style={{ zIndex: 10 }}
      >
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-12 bg-primary/20 rounded-l" />
      </div>

      {/* Header */}
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 min-w-0">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-app-text-primary truncate min-w-0">
            <FileText className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Notes</span>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 flex-shrink-0">
              {notes.length}
            </Badge>
          </h2>
          <Button onClick={onNewNote} size="sm" className="shadow-sm flex-shrink-0 ml-2">
            <PlusCircle className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-app-text-muted px-2">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs opacity-70">Click "New" to create one</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                draggable
                onDragStart={(e) => handleDragStart(e, note)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelectNote(note)}
                onContextMenu={(e) => handleNoteContextMenu(e, note)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all min-w-0
                  ${currentNote?.id === note.id
                    ? 'bg-primary text-primary-foreground shadow-md scale-[0.98]'
                    : 'hover:bg-muted/50 text-app-text-primary'
                  }
                  ${draggedNote?.id === note.id ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-1 min-w-0">
                  <h3 className="font-medium text-sm truncate flex-1 min-w-0">
                    {note.title || 'Untitled'}
                  </h3>
                  {note.tags && note.tags.length > 0 && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0 truncate" style={{ maxWidth: '35%' }}>
                      {note.tags[0]}
                    </Badge>
                  )}
                </div>
                <p className={`text-xs line-clamp-2 break-words overflow-hidden ${currentNote?.id === note.id ? 'opacity-90' : 'opacity-60'}`}>
                  {getPlainTextPreview(note.content, 100)}
                </p>
                <div className={`flex items-center gap-2 mt-2 text-xs min-w-0 ${currentNote?.id === note.id ? 'opacity-80' : 'opacity-50'}`}>
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{new Date(note.updated_at || note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <Separator className="opacity-50" />
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-app-text-muted min-w-0">
          <span className="font-medium truncate">{notes.length} notes</span>
          <div className="flex gap-2 opacity-60 flex-shrink-0 ml-2">
            <Folder className="w-4 h-4" />
            <Tag className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

