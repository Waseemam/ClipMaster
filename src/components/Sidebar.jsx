import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText, Clock, Folder, Tag } from 'lucide-react';

export function Sidebar({ notes, currentNote, onNewNote, onSelectNote }) {
  return (
    <div className="w-80 border-r border-border/50 bg-app-bg-tertiary flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-app-text-primary">
            <FileText className="w-5 h-5" />
            Notes
          </h2>
          <Button onClick={onNewNote} size="sm" className="shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-app-text-muted">
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
                  p-3 rounded-lg cursor-pointer transition-all
                  ${currentNote?.id === note.id 
                    ? 'bg-primary text-primary-foreground shadow-md scale-[0.98]' 
                    : 'hover:bg-muted/50 text-app-text-primary'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate flex-1">
                    {note.title || 'Untitled'}
                  </h3>
                  {note.tags && note.tags.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {note.tags[0]}
                    </Badge>
                  )}
                </div>
                <p className={`text-xs line-clamp-2 ${currentNote?.id === note.id ? 'opacity-90' : 'opacity-60'}`}>
                  {note.content ? note.content.substring(0, 100) : 'No content'}
                </p>
                <div className={`flex items-center gap-2 mt-2 text-xs ${currentNote?.id === note.id ? 'opacity-80' : 'opacity-50'}`}>
                  <Clock className="w-3 h-3" />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <Separator className="opacity-50" />
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-app-text-muted">
          <span className="font-medium">{notes.length} notes</span>
          <div className="flex gap-2 opacity-60">
            <Folder className="w-4 h-4" />
            <Tag className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

