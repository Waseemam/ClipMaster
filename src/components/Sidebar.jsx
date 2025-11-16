import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText, Clock, Folder, Tag } from 'lucide-react';

export function Sidebar({ notes, currentNote, onNewNote, onSelectNote }) {
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
                onClick={() => onSelectNote(note)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all min-w-0
                  ${currentNote?.id === note.id 
                    ? 'bg-primary text-primary-foreground shadow-md scale-[0.98]' 
                    : 'hover:bg-muted/50 text-app-text-primary'
                  }
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
                  {note.content ? note.content.substring(0, 100) : 'No content'}
                </p>
                <div className={`flex items-center gap-2 mt-2 text-xs min-w-0 ${currentNote?.id === note.id ? 'opacity-80' : 'opacity-50'}`}>
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{new Date(note.updatedAt).toLocaleDateString()}</span>
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
    </div>
  );
}

