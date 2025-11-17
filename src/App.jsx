import React, { useState, useEffect } from 'react';
import { TitleBar } from '@/components/TitleBar';
import { Navigation } from '@/components/Navigation';
import { Sidebar } from '@/components/Sidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { ClipboardPage } from '@/components/ClipboardPage';
import { SettingsDialog } from '@/components/SettingsDialog';
import { db } from '@/lib/localDb';

function App() {
  const [currentView, setCurrentView] = useState('notes'); // 'notes' or 'clipboard'
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isNewNote, setIsNewNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark'); // Default to dark theme
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Update notification states
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateVersion, setUpdateVersion] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  // Apply theme on mount and when it changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  // Listen for context menu new note event
  useEffect(() => {
    const handleContextMenuNewNote = () => {
      handleNewNote();
    };

    window.electronAPI?.onContextMenuNewNote(handleContextMenuNewNote);

    return () => {
      window.electronAPI?.removeContextMenuListener();
    };
  }, []);

  // Listen for update events
  useEffect(() => {
    console.log('[UPDATE] Setting up update listeners...');
    
    window.electronAPI?.onUpdateAvailable((version) => {
      console.log('[UPDATE] Update available:', version);
      setUpdateAvailable(true);
      setUpdateVersion(version);
    });

    window.electronAPI?.onDownloadProgress((percent) => {
      console.log('[UPDATE] Download progress:', percent + '%');
      setDownloadProgress(percent);
    });

    window.electronAPI?.onUpdateDownloaded((version) => {
      console.log('[UPDATE] Update downloaded:', version);
      setUpdateDownloaded(true);
      setUpdateVersion(version);
    });

    return () => {
      window.electronAPI?.removeUpdateListeners();
    };
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await db.getNotes();
      if (response.success && response.data) {
        const notesList = response.data;
        setNotes(notesList);
        // Load the most recently updated note
        if (notesList.length > 0) {
          setCurrentNote(notesList[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNote = () => {
    setCurrentNote(null);
    setIsNewNote(true);
  };

  const handleSelectNote = (note) => {
    setCurrentNote(note);
    setIsNewNote(false);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (currentNote && !isNewNote) {
        // Update existing note
        const response = await db.updateNote(currentNote.id, noteData);
        if (response.success) {
          await loadNotes();
          // Find and set the updated note
          const updatedNote = notes.find(n => n.id === currentNote.id);
          if (updatedNote) {
            setCurrentNote({ ...updatedNote, ...noteData });
          }
        }
      } else {
        // Create new note
        const response = await db.createNote(noteData);
        if (response.success) {
          await loadNotes();
          // Set the newly created note as current
          if (response.data) {
            setCurrentNote(response.data);
            setIsNewNote(false);
          }
        }
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await db.deleteNote(noteId);
      if (response.success) {
        await loadNotes();
        setCurrentNote(null);
        setIsNewNote(false);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-muted-foreground">Loading ClipMaster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-app-bg-secondary">
      <TitleBar 
        theme={theme} 
        onThemeToggle={handleThemeToggle}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      {/* Update notification banner */}
      {updateDownloaded && (
        <div className="bg-green-600 text-white px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">
            ✨ Update {updateVersion} is ready! Restart to install.
          </span>
          <button
            onClick={() => window.electronAPI?.installUpdate()}
            className="bg-white text-green-600 px-4 py-1 rounded text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Restart Now
          </button>
        </div>
      )}
      
      {updateAvailable && !updateDownloaded && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">
            {downloadProgress > 0 
              ? `Downloading update... ${Math.round(downloadProgress)}%`
              : `🎉 New version ${updateVersion} available!`
            }
          </span>
          {downloadProgress === 0 && (
            <button
              onClick={() => window.electronAPI?.downloadUpdate()}
              className="bg-white text-red-600 px-4 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Download
            </button>
          )}
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        {currentView === 'notes' ? (
          <>
            <Sidebar
              notes={notes}
              currentNote={currentNote}
              onNewNote={handleNewNote}
              onSelectNote={handleSelectNote}
            />
            <NoteEditor
              note={isNewNote ? null : currentNote}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          </>
        ) : (
          <ClipboardPage />
        )}
      </div>
      
      {/* Settings Dialog */}
      <SettingsDialog 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      {/* Version Display - Bottom Left */}
      <div className="fixed bottom-2 left-2 text-xs text-app-text-muted opacity-50 hover:opacity-100 transition-opacity px-2 py-1 bg-app-bg-primary rounded border border-border/30 select-none">
        v{import.meta.env.APP_VERSION || '1.1.1'}
      </div>
    </div>
  );
}

export default App;

