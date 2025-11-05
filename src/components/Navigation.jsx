import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Clipboard as ClipboardIcon } from 'lucide-react';

export function Navigation({ currentView, onViewChange }) {
  return (
    <div className="w-20 bg-app-bg-primary border-r border-border/50 flex flex-col items-center py-4 gap-2">
      <Button
        variant={currentView === 'notes' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => onViewChange('notes')}
        className="w-12 h-12 rounded-xl"
        title="Notes"
      >
        <FileText className="w-5 h-5" />
      </Button>
      
      <Button
        variant={currentView === 'clipboard' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => onViewChange('clipboard')}
        className="w-12 h-12 rounded-xl"
        title="Clipboard History"
      >
        <ClipboardIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}

