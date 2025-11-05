import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, Plus, X, Wand2, FileText, Sparkles, Tag, Eye, Edit } from 'lucide-react';
import { autoMarkdown, summarizeText, fixAndClearText, autoTitleAndTags } from '@/lib/ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function NoteEditor({ note, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setHasChanges(false);
    } else {
      // New note
      setTitle('');
      setContent('');
      setTags([]);
      setHasChanges(false);
    }
  }, [note]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setHasChanges(true);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setHasChanges(true);
  };

  const handleSave = () => {
    const noteData = {
      title: title.trim() || 'Untitled',
      content: content.trim(),
      tags,
      folderId: note?.folderId || null,
    };
    onSave(noteData);
    setHasChanges(false);
  };

  const handleDelete = () => {
    if (note && confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  // AI Function Handlers
  const handleAutoMarkdown = async () => {
    if (!content.trim()) {
      setAiError('No content to format');
      return;
    }
    
    setAiLoading(true);
    setAiError('');
    
    try {
      const result = await autoMarkdown(content);
      if (result.success) {
        setContent(result.text);
        setHasChanges(true);
      } else {
        setAiError(result.error);
      }
    } catch (error) {
      setAiError('Failed to format markdown');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!content.trim()) {
      setAiError('No content to summarize');
      return;
    }
    
    setAiLoading(true);
    setAiError('');
    
    try {
      const result = await summarizeText(content);
      if (result.success) {
        setSummary(result.text);
        setShowSummary(true);
      } else {
        setAiError(result.error);
      }
    } catch (error) {
      setAiError('Failed to summarize');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFixText = async () => {
    if (!content.trim()) {
      setAiError('No content to fix');
      return;
    }
    
    setAiLoading(true);
    setAiError('');
    
    try {
      const result = await fixAndClearText(content);
      if (result.success) {
        setContent(result.text);
        setHasChanges(true);
      } else {
        setAiError(result.error);
      }
    } catch (error) {
      setAiError('Failed to fix text');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAutoTitleTags = async () => {
    if (!content.trim()) {
      setAiError('No content to analyze');
      return;
    }
    
    setAiLoading(true);
    setAiError('');
    
    try {
      const result = await autoTitleAndTags(content);
      if (result.success) {
        setTitle(result.title);
        setTags(result.tags);
        setHasChanges(true);
      } else {
        setAiError(result.error);
      }
    } catch (error) {
      setAiError('Failed to generate title and tags');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-app-bg-secondary">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-6 bg-app-bg-secondary">
        <div className="flex items-center justify-between gap-6 mb-6">
          <Input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={handleTitleChange}
            className="text-3xl font-bold border-none shadow-none px-0 py-2 pr-4 focus-visible:ring-0 bg-transparent placeholder:text-app-text-muted text-app-text-primary"
          />
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex border rounded-md overflow-hidden shadow-sm">
              <Button
                variant={viewMode === 'edit' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('edit')}
                className="rounded-none h-8 px-3"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                variant={viewMode === 'split' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('split')}
                className="rounded-none h-8 px-3 border-x"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Split
              </Button>
              <Button
                variant={viewMode === 'preview' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('preview')}
                className="rounded-none h-8 px-3"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Preview
              </Button>
            </div>
            {note && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={handleSave}
              size="sm"
              disabled={!hasChanges && note}
              className="shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 shadow-sm">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                onClick={() => handleRemoveTag(tag)}
              />
            </Badge>
          ))}
          <Input
            type="text"
            placeholder="Add tag (press Enter)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="w-40 h-7 text-xs bg-input border-input-border shadow-sm"
          />
        </div>
      </div>

      {/* AI Toolbar */}
      <div className="border-b border-border/50 px-8 py-3 bg-app-bg-primary">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-app-text-muted mr-2">AI Tools:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoMarkdown}
            disabled={aiLoading || !content.trim()}
            className="text-xs h-7"
          >
            <FileText className="w-3 h-3 mr-1.5" />
            Auto Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSummarize}
            disabled={aiLoading || !content.trim()}
            className="text-xs h-7"
          >
            <Wand2 className="w-3 h-3 mr-1.5" />
            Summarize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFixText}
            disabled={aiLoading || !content.trim()}
            className="text-xs h-7"
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Fix & Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoTitleTags}
            disabled={aiLoading || !content.trim()}
            className="text-xs h-7"
          >
            <Tag className="w-3 h-3 mr-1.5" />
            Auto Title & Tags
          </Button>
          {aiLoading && (
            <span className="text-xs text-blue-500 animate-pulse ml-2">
              Processing...
            </span>
          )}
          {aiError && (
            <span className="text-xs text-destructive ml-2">
              {aiError}
            </span>
          )}
        </div>
      </div>

      {/* Summary View */}
      {showSummary && (
        <div className="border-b border-border/50 px-8 py-4 bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  Summary
                </span>
              </div>
              <p className="text-sm text-app-text-primary leading-relaxed">
                {summary}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSummary(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Content Editor/Preview */}
      <div className="flex-1 overflow-hidden flex">
        {viewMode === 'edit' && (
          <div className="flex-1 px-8 py-6 overflow-auto">
            <Textarea
              placeholder="Start writing your note... (Supports Markdown)"
              value={content}
              onChange={handleContentChange}
              className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base bg-transparent placeholder:text-app-text-muted text-app-text-primary leading-relaxed font-mono"
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="flex-1 px-8 py-6 overflow-auto">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-app-text-muted italic">No content to preview</p>
              )}
            </div>
          </div>
        )}

        {viewMode === 'split' && (
          <>
            {/* Editor Side */}
            <div className="flex-1 border-r border-border/50 overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-b border-border/50 bg-app-bg-primary">
                <span className="text-xs font-semibold text-app-text-secondary">MARKDOWN</span>
              </div>
              <div className="flex-1 px-6 py-4 overflow-auto">
                <Textarea
                  placeholder="Start writing your note..."
                  value={content}
                  onChange={handleContentChange}
                  className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-sm bg-transparent placeholder:text-app-text-muted text-app-text-primary leading-relaxed font-mono"
                />
              </div>
            </div>
            
            {/* Preview Side */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-b border-border/50 bg-app-bg-primary">
                <span className="text-xs font-semibold text-app-text-secondary">PREVIEW</span>
              </div>
              <div className="flex-1 px-6 py-4 overflow-auto">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
                  {content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-app-text-muted italic text-sm">Preview will appear here...</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Info */}
      {note && (
        <div className="border-t border-border/50 px-8 py-3 text-xs text-app-text-muted bg-app-bg-secondary">
          Last updated: {new Date(note.updatedAt || note.createdAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

