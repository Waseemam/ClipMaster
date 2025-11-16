import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Moon, Sun, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TitleBar({ theme, onThemeToggle, onOpenSettings }) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Listen for maximize/unmaximize events
    if (window.electronAPI) {
      window.electronAPI.onMaximizeChange(() => setIsMaximized(true));
      window.electronAPI.onUnmaximizeChange(() => setIsMaximized(false));
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div 
      className="h-12 bg-app-bg-primary border-b border-border/50 flex items-center justify-between px-4 select-none shadow-sm"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Left: App Title */}
      <div className="flex items-center gap-3">
        <div className="text-xl">📝</div>
        <span className="text-sm font-semibold text-app-text-primary">ClipMaster</span>
      </div>

      {/* Center: Could add tabs here in the future */}
      <div className="flex-1"></div>

      {/* Right: Theme Toggle & Window Controls */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className="h-8 w-8 hover:bg-muted/80 text-app-text-secondary hover:text-app-text-primary transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="h-8 w-8 hover:bg-muted/80 text-app-text-secondary hover:text-app-text-primary transition-all"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Minimize */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMinimize}
          className="h-8 w-8 hover:bg-muted/80 rounded-none text-app-text-secondary hover:text-app-text-primary transition-all"
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Maximize/Restore */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMaximize}
          className="h-8 w-8 hover:bg-muted/80 rounded-none text-app-text-secondary hover:text-app-text-primary transition-all"
        >
          <Square className={`h-3.5 w-3.5 ${isMaximized ? 'scale-90' : ''}`} />
        </Button>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground rounded-none text-app-text-secondary transition-all"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

