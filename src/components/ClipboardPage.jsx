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
  Upload,
  CheckCircle2,
  Circle,
  Clipboard as ClipboardIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { generateClipboardTitle } from '@/lib/ai';

export function ClipboardPage() {
  const [clipboardItems, setClipboardItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedIds, setUploadedIds] = useState(new Set());
  const [generatingTitles, setGeneratingTitles] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Load clipboard history from database on mount
  useEffect(() => {
    loadClipboardHistory();
  }, []);

  const loadClipboardHistory = async () => {
    try {
      setLoading(true);
      const response = await api.getClipboardHistory();
      
      if (response.success && response.data.items) {
        // Convert server items to local format
        const serverItems = response.data.items.map(item => {
          // Parse content: {title}, {content}
          let title, content;
          if (item.content.includes(', ')) {
            const firstCommaIndex = item.content.indexOf(', ');
            title = item.content.substring(0, firstCommaIndex);
            content = item.content.substring(firstCommaIndex + 2); // +2 to skip ", "
          } else {
            // Fallback if no title format
            title = item.content.split('\n')[0].substring(0, 60);
            content = item.content;
          }
          
          return {
            id: item.id,
            content: content,
            type: item.type,
            timestamp: item.createdAt,
            uploaded: true,
            title: title,
          };
        });
        setClipboardItems(serverItems);
        
        // Mark all server items as uploaded
        const uploadedSet = new Set(serverItems.map(item => item.id));
        setUploadedIds(uploadedSet);
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
        setClipboardItems(prev => {
          // Check for duplicates - don't add if the exact same content exists in recent items
          const isDuplicate = prev.slice(0, 10).some(item => 
            item.content === data.content && item.type === data.type
          );
          
          if (isDuplicate) {
            console.log('Duplicate clipboard item detected, skipping...');
            return prev;
          }
          
          // Generate temporary title from first line
          const tempTitle = data.type === 'text' 
            ? data.content.split('\n')[0].substring(0, 60).trim() || 'Clipboard Item'
            : 'Image';
          
          // Add to local state with unique ID
          const newItem = {
            id: Date.now() + Math.random(),
            ...data,
            uploaded: false,
            title: tempTitle,
          };
          
          // Check if it should be auto-uploaded
          if (shouldAutoUpload(data.content, prev)) {
            uploadToServer(newItem);
          }
          
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

  const shouldAutoUpload = (content, existingItems) => {
    // Don't upload if too short
    if (content.length < 10) return false;
    
    // Don't upload if it's a duplicate of recently uploaded items
    const recentUploaded = existingItems
      .filter(item => item.uploaded)
      .slice(0, 50);
    
    for (const item of recentUploaded) {
      if (item.content === content) return false;
    }
    
    // Don't upload if it looks like temporary/junk data
    const junkPatterns = [
      /^[\d\s]+$/, // Only numbers and spaces
      /^[a-z]$/, // Single letter
      /^(http|https):\/\/.*\.(jpg|jpeg|png|gif)$/i, // Direct image URLs
    ];
    
    for (const pattern of junkPatterns) {
      if (pattern.test(content.trim())) return false;
    }
    
    // Upload if it looks relevant
    return true;
  };

  const uploadToServer = async (item) => {
    // Add to generating state
    setGeneratingTitles(prevSet => {
      const newSet = new Set(prevSet || new Set());
      newSet.add(item.id);
      return newSet;
    });
    
    try {
      // Generate AI title for text content
      let title = item.title || item.content.split('\n')[0].substring(0, 60).trim(); // Use existing title or first line
      
      if (item.type === 'text' && item.content.length > 20) {
        const titleResult = await generateClipboardTitle(item.content);
        if (titleResult.success) {
          title = titleResult.title;
        }
      }
      
      // Format content as {title}, {content} for storage
      const formattedContent = `${title}, ${item.content}`;
      
      const response = await api.saveClipboardItem({
        content: formattedContent,
        type: item.type,
      });
      
      if (response.success) {
        // Mark as uploaded
        setUploadedIds(prevSet => {
          const newSet = new Set(prevSet || new Set());
          newSet.add(item.id);
          return newSet;
        });
        
        // Update item with AI-generated title and uploaded status
        setClipboardItems(prevItems => 
          (prevItems || []).map(i => i.id === item.id ? { ...i, uploaded: true, title } : i)
        );
      }
    } catch (error) {
      console.error('Failed to upload clipboard item:', error);
    } finally {
      // Remove from generating state
      setGeneratingTitles(prevSet => {
        const newSet = new Set(prevSet || new Set());
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const manualUpload = (item) => {
    if (!item.uploaded) {
      uploadToServer(item);
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  const deleteItem = async (id, isUploaded) => {
    // Delete from local state
    setClipboardItems(prevItems => (prevItems || []).filter(item => item.id !== id));
    setUploadedIds(prevSet => {
      const newSet = new Set(prevSet || new Set());
      newSet.delete(id);
      return newSet;
    });

    // Also delete from server if it was uploaded
    if (isUploaded) {
      try {
        await api.deleteClipboardItem(id);
      } catch (error) {
        console.error('Failed to delete clipboard item from server:', error);
      }
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to clear all clipboard history? This cannot be undone.')) {
      return;
    }

    try {
      // Clear from server
      await api.clearClipboardHistory();
      
      // Clear local state
      setClipboardItems([]);
      setUploadedIds(new Set());
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
              {clipboardItems.length} items • {uploadedIds.size} uploaded
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
                            {item.uploaded ? (
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Uploaded</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-app-text-muted">
                                <Circle className="w-3 h-3" />
                                <span>Local only</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Display title for all items */}
                          {item.title && (
                            <h4 className={`text-sm font-semibold mb-1 ${
                              item.uploaded 
                                ? 'text-app-text-primary' 
                                : 'text-app-text-secondary italic'
                            }`}>
                              {item.title}
                              {!item.uploaded && generatingTitles.has(item.id) && (
                                <span className="ml-2 text-xs text-blue-500">
                                  (generating AI title...)
                                </span>
                              )}
                            </h4>
                          )}
                          
                          {item.type === 'text' ? (
                            <p className="text-sm text-app-text-primary line-clamp-3 whitespace-pre-wrap break-words font-mono">
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
                          {!item.uploaded && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => manualUpload(item)}
                              className="h-8 w-8"
                              title="Upload to server with AI title"
                              disabled={generatingTitles.has(item.id)}
                            >
                              {generatingTitles.has(item.id) ? (
                                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                            </Button>
                          )}
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
                            onClick={() => deleteItem(item.id, item.uploaded)}
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

