import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, X, Wand2, FileText, Sparkles, Tag } from 'lucide-react';
import { autoMarkdown, summarizeText, fixAndClearText, autoTitleAndTags, autoFormatHTML } from '@/lib/ai';
import TipTapEditor from './TipTapEditor';

import { marked } from 'marked';

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

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');

      // Convert Markdown to HTML if needed
      const rawContent = note.content || '';
      const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);

      if (!isHtml && rawContent.trim()) {
        // Assume Markdown and convert
        // marked.parse returns a promise if async is on, but by default it's sync. 
        // We should check if it's sync. marked v12+ might be async? 
        // marked.parse is synchronous by default unless async option is set.
        try {
          const html = marked.parse(rawContent);
          setContent(html);
        } catch (e) {
          console.error('Failed to parse markdown', e);
          setContent(rawContent);
        }
      } else {
        setContent(rawContent);
      }

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

  const handleContentChange = (newContent) => {
    setContent(newContent);
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
      content: content, // This is now HTML
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

  // Helper to extract plain text from HTML
  const getPlainText = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const handleAiAction = async (action) => {
    const plainText = getPlainText(content);
    if (!plainText.trim()) {
      setAiError('No content to process');
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      if (action === 'fix') {
        // Pass HTML content directly to AI to preserve formatting
        const result = await fixAndClearText(content);
        if (result.success) {
          setContent(result.text);
          setHasChanges(true);
        } else {
          setAiError(result.error);
        }
      } else if (action === 'format') {
        // Auto format HTML with proper structure
        const result = await autoFormatHTML(content);
        if (result.success) {
          setContent(result.text);
          setHasChanges(true);
        } else {
          setAiError(result.error);
        }
      } else if (action === 'summarize') {
        const result = await summarizeText(plainText);
        if (result.success) {
          setSummary(result.text);
          setShowSummary(true);
        } else {
          setAiError(result.error);
        }
      } else if (action === 'tags') {
        const result = await autoTitleAndTags(plainText);
        if (result.success) {
          setTitle(result.title);
          setTags(result.tags);
          setHasChanges(true);
        } else {
          setAiError(result.error);
        }
      }
    } catch (error) {
      setAiError(`Failed to perform ${action}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-app-bg-secondary">
      {/* Header */}
      <div className="border-b border-border px-8 py-6 bg-app-bg-secondary">
        <div className="flex items-center justify-between gap-6 mb-6">
          <Input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={handleTitleChange}
            className="text-3xl font-bold border-none shadow-none px-0 py-2 pr-4 focus-visible:ring-0 bg-transparent placeholder:text-app-text-muted text-app-text-primary"
          />
          <div className="flex gap-2 flex-shrink-0">
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
            <Badge key={tag} variant="secondary" className="gap-1 shadow-sm bg-app-bg-tertiary text-app-text-primary hover:bg-app-bg-tertiary/80">
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
            className="w-40 h-7 text-xs bg-app-bg-primary border-input-border shadow-sm text-app-text-primary placeholder:text-app-text-muted"
          />
        </div>
      </div>

      {/* AI Loading/Error Status (Overlay or small bar) */}
      {(aiLoading || aiError) && (
        <div className="px-8 py-2 bg-app-bg-primary border-b border-border flex items-center gap-2">
          {aiLoading && <span className="text-xs text-blue-500 animate-pulse">AI Processing...</span>}
          {aiError && <span className="text-xs text-destructive">{aiError}</span>}
        </div>
      )}

      {/* Summary View */}
      {showSummary && (
        <div className="border-b border-border px-8 py-4 bg-blue-50 dark:bg-blue-950/20">
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
              className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* TipTap Editor */}
      <div className="flex-1 overflow-hidden">
        <TipTapEditor
          content={content}
          onChange={handleContentChange}
          onSave={handleSave}
          onAiAction={handleAiAction}
        />
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
