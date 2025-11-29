import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Copy,
  Search,
  Trash2,
  Clock,
  Filter,
  Sparkles,
  Clipboard as ClipboardIcon,
} from 'lucide-react';
import { db } from '@/lib/localDb';
import { generateClipboardTitle } from '@/lib/ai';

export function ClipboardPage() {
  const [clipboardItems, setClipboardItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingTitles, setGeneratingTitles] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(14); // Default font size in pixels

  // Load clipboard history from database on mount
  useEffect(() => {
    loadClipboardHistory();
  }, []);

  const loadClipboardHistory = async () => {
    try {
      setLoading(true);
      const response = await db.getClipboardHistory();

      if (response.success && response.data.items) {
        // Convert database items to local format
        const dbItems = response.data.items.map(item => {
          return {
            id: item.id,
            content: item.content,
            type: item.type,
            timestamp: item.created_at,
            title: item.title || item.content.split('\n')[0].substring(0, 60),
          };
        });
        setClipboardItems(dbItems);
      }
    } catch (error) {
      console.error('Failed to load clipboard history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Start clipboard monitoring
    if (window.electronAPI) {
      window.electronAPI.startClipboardMonitoring();

      window.electronAPI.onClipboardChange((data) => {
        // Add the new item to the top of the list without reloading everything
        setClipboardItems(prev => {
          // Check if this item already exists (avoid duplicates)
          const isDuplicate = prev.some(item =>
            item.content === data.content && item.type === data.type
          );

          if (isDuplicate) {
            return prev;
          }

          // Add new item to the beginning
          const newItem = {
            id: Date.now() + Math.random(),
            content: data.content,
            type: data.type,
            timestamp: data.timestamp,
            title: data.type === 'text'
              ? data.content.split('\n')[0].substring(0, 60).trim() || 'Clipboard Item'
              : 'Image',
          };

          return [newItem, ...prev];
        });
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeClipboardListener();
      }
    };
  }, []);

  // Font size keyboard shortcuts and scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + = or Ctrl + + to increase font size
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setFontSize(prev => Math.min(prev + 2, 32)); // Max 32px
      }
      // Ctrl + - to decrease font size
      else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        setFontSize(prev => Math.max(prev - 2, 10)); // Min 10px
      }
      // Ctrl + 0 to reset font size
      else if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        setFontSize(14); // Reset to default
      }
    };

    const handleWheel = (e) => {
      // Ctrl + Scroll to change font size
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          // Scrolling up - increase font size
          setFontSize(prev => Math.min(prev + 2, 32));
        } else if (e.deltaY > 0) {
          // Scrolling down - decrease font size
          setFontSize(prev => Math.max(prev - 2, 10));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Generate AI title for a clipboard item
  const generateAITitle = async (item) => {
    if (item.type !== 'text' || item.content.length < 20) {
      return;
    }

    setGeneratingTitles(prevSet => {
      const newSet = new Set(prevSet || new Set());
      newSet.add(item.id);
      return newSet;
    });

    try {
      const titleResult = await generateClipboardTitle(item.content);
      if (titleResult.success) {
        // Update the item in the database with the AI-generated title
        await db.saveClipboardItem({
          content: item.content,
          type: item.type,
          title: titleResult.title,
        });
        // Reload to show updated title
        await loadClipboardHistory();
      }
    } catch (error) {
      console.error('Failed to generate AI title:', error);
    } finally {
      setGeneratingTitles(prevSet => {
        const newSet = new Set(prevSet || new Set());
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  const deleteItem = async (id) => {
    try {
      await db.deleteClipboardItem(id);
      // Reload clipboard history to reflect the deletion
      await loadClipboardHistory();
    } catch (error) {
      console.error('Failed to delete clipboard item from database:', error);
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to clear all clipboard history? This cannot be undone.')) {
      return;
    }

    try {
      // Clear from database
      await db.clearClipboardHistory();

      // Reload to show empty state
      await loadClipboardHistory();
    } catch (error) {
      console.error('Failed to clear clipboard history:', error);
      alert('Failed to clear clipboard history. Please try again.');
    }
  };

  const filteredItems = clipboardItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.content.toLowerCase().includes(query) ||
      (item.title && item.title.toLowerCase().includes(query))
    );
  });

  const groupByDate = (items) => {
    const groups = {};
    const today = new Date().toDateString();
    
    items.forEach(item => {
      const itemDate = new Date(item.timestamp).toDateString();
      const label = itemDate === today ? 'Today' : itemDate;
      
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(item);
    });
    
    return groups;
  };

  const groupedItems = groupByDate(filteredItems);

  return (
    <div className="flex-1 flex flex-col h-full bg-app-bg-secondary">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-6 bg-app-bg-secondary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-app-text-primary">Clipboard History</h1>
            <p className="text-sm text-app-text-muted mt-1">
              {clipboardItems.length} items
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="shadow-sm"
              onClick={clearAllHistory}
              disabled={clipboardItems.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-app-text-muted" />
          <Input
            type="text"
            placeholder="Search clipboard history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-input-border"
          />
        </div>
      </div>

      {/* Clipboard Items */}
      <ScrollArea className="flex-1">
        <div className="px-8 py-4 space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-app-text-muted">Loading clipboard history...</p>
            </div>
          ) : Object.entries(groupedItems).length === 0 ? (
            <div className="text-center py-16">
              <ClipboardIcon className="w-16 h-16 mx-auto mb-4 opacity-20 text-app-text-muted" />
              <p className="text-app-text-muted">No clipboard items yet</p>
              <p className="text-sm text-app-text-muted mt-2">
                Copy something to get started
              </p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-app-text-muted" />
                  <h3 className="text-sm font-semibold text-app-text-secondary">
                    {date}
                  </h3>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-app-bg-primary rounded-lg border border-border/50 p-4 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={item.type === 'image' ? 'default' : 'secondary'} className="text-xs">
                              {item.type}
                            </Badge>
                            <span className="text-xs text-app-text-muted">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          {/* Display title for all items */}
                          {item.title && (
                            <h4 className="text-sm font-semibold mb-1 text-app-text-primary">
                              {item.title}
                              {generatingTitles.has(item.id) && (
                                <span className="ml-2 text-xs text-blue-500">
                                  (generating AI title...)
                                </span>
                              )}
                            </h4>
                          )}
                          
                          {item.type === 'text' ? (
                            <p className="text-sm text-app-text-primary line-clamp-3 whitespace-pre-wrap break-words font-mono" style={{ fontSize: `${fontSize}px` }}>
                              {item.content}
                            </p>
                          ) : (
                            <img 
                              src={item.content} 
                              alt="Clipboard" 
                              className="max-w-xs max-h-32 rounded border border-border/50"
                            />
                          )}
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateAITitle(item)}
                            className="h-8 w-8"
                            title="Generate AI title"
                            disabled={generatingTitles.has(item.id) || item.type !== 'text'}
                          >
                            {generatingTitles.has(item.id) ? (
                              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </Button>
                          {item.type === 'text' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(item.content)}
                              className="h-8 w-8"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteItem(item.id)}
                            className="h-8 w-8 text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

