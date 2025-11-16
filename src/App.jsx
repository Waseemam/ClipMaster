import React, { useState, useEffect } from 'react';
import { TitleBar } from '@/components/TitleBar';
import { Navigation } from '@/components/Navigation';
import { Sidebar } from '@/components/Sidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { ClipboardPage } from '@/components/ClipboardPage';
import { db } from '@/lib/localDb';
import { checkMigrationNeeded, migrateFromApiToLocal } from '@/lib/migrate';

function App() {
  const [currentView, setCurrentView] = useState('notes'); // 'notes' or 'clipboard'
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isNewNote, setIsNewNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark'); // Default to dark theme

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

  // Load notes on mount and check for migration
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Check if migration is needed
    const needsMigration = await checkMigrationNeeded();
    
    if (needsMigration) {
      console.log('🔄 Migration needed, starting data migration...');
      const result = await migrateFromApiToLocal();
      
      if (result.success) {
        console.log('✅ Migration completed successfully!');
      } else {
        console.warn('⚠️ Migration completed with errors:', result.errors);
      }
    }
    
    // Load notes
    await loadNotes();
  };

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
      <TitleBar theme={theme} onThemeToggle={handleThemeToggle} />
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
    </div>
  );
}

export default App;

