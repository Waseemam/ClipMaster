import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Folder, Sparkles, Filter } from 'lucide-react';
import { FolderRulesDialog } from './FolderRulesDialog';

const FOLDER_TYPES = [
  { value: 'manual', label: 'Manual', description: 'Manually organize notes' },
  { value: 'dynamic', label: 'Dynamic', description: 'Auto-organize based on rules' },
  { value: 'hybrid', label: 'Dynamic + Manual', description: 'Auto-organize with manual override' },
];

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function FolderSettingsDialog({ folder, isOpen, onClose, onSave }) {
  const [name, setName] = useState(folder?.name || '');
  const [type, setType] = useState(folder?.type || 'manual');
  const [color, setColor] = useState(folder?.color || COLORS[0]);
  const [icon, setIcon] = useState(folder?.icon || 'folder');
  const [rules, setRules] = useState(folder?.rules || []);
  const [matchType, setMatchType] = useState(folder?.matchType || 'all');
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      type,
      color,
      icon,
      rules: (type === 'dynamic' || type === 'hybrid') ? rules : [],
      matchType: (type === 'dynamic' || type === 'hybrid') ? matchType : 'all',
    });
  };

  const handleRulesSave = (rulesData) => {
    setRules(rulesData.rules);
    setMatchType(rulesData.matchType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-app-bg-secondary border border-border/50 rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-app-text-primary">
            {folder ? 'Folder Settings' : 'Create Folder'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Folder Name */}
        <div className="mb-4">
          <label className="text-sm font-medium text-app-text-primary mb-2 block">
            Folder Name
          </label>
          <Input
            type="text"
            placeholder="Enter folder name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-input border-input-border"
          />
        </div>

        {/* Folder Type */}
        <div className="mb-4">
          <label className="text-sm font-medium text-app-text-primary mb-2 block">
            Organization Type
          </label>
          <div className="space-y-2">
            {FOLDER_TYPES.map((folderType) => (
              <button
                key={folderType.value}
                onClick={() => setType(folderType.value)}
                className={`
                  w-full p-3 rounded-lg border text-left transition-all
                  ${
                    type === folderType.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-app-bg-primary hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  {folderType.value === 'dynamic' && <Sparkles className="w-4 h-4 text-primary" />}
                  <span className="font-medium text-app-text-primary">{folderType.label}</span>
                </div>
                <p className="text-xs text-app-text-muted">{folderType.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Rules Button - Only show for dynamic/hybrid folders */}
        {(type === 'dynamic' || type === 'hybrid') && (
          <div className="mb-4">
            <label className="text-sm font-medium text-app-text-primary mb-2 block">
              Automation Rules
            </label>
            <Button
              variant="outline"
              onClick={() => setRulesDialogOpen(true)}
              className="w-full gap-2"
            >
              <Filter className="w-4 h-4" />
              Configure Rules ({rules.length})
            </Button>
            {rules.length > 0 && (
              <p className="text-xs text-app-text-muted mt-2">
                {rules.length} rule group{rules.length !== 1 ? 's' : ''} •{' '}
                {rules.reduce((total, rule) => total + (rule.conditions?.length || 1), 0)} condition{rules.reduce((total, rule) => total + (rule.conditions?.length || 1), 0) !== 1 ? 's' : ''} •{' '}
                Match {matchType === 'all' ? 'ALL' : 'ANY'}
              </p>
            )}
          </div>
        )}

        {/* Color Picker */}
        <div className="mb-4">
          <label className="text-sm font-medium text-app-text-primary mb-2 block">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`
                  w-10 h-10 rounded-lg transition-all
                  ${color === c ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}
                `}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker (simplified for now) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-app-text-primary mb-2 block">
            Icon
          </label>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">
              <Folder className="w-4 h-4 mr-1" style={{ color }} />
              Folder Icon
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {folder ? 'Save Changes' : 'Create Folder'}
          </Button>
        </div>
      </div>

      {/* Rules Dialog */}
      <FolderRulesDialog
        folder={{ rules, matchType }}
        isOpen={rulesDialogOpen}
        onClose={() => setRulesDialogOpen(false)}
        onSave={handleRulesSave}
      />
    </div>
  );
}
