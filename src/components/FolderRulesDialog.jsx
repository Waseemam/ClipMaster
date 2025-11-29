import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2, Filter } from 'lucide-react';

const RULE_FIELDS = [
  { value: 'title', label: 'Title' },
  { value: 'content', label: 'Content' },
  { value: 'tags', label: 'Tags' },
  { value: 'created_date', label: 'Created Date' },
  { value: 'updated_date', label: 'Updated Date' },
];

const RULE_OPERATORS = {
  title: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
  ],
  content: [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
  ],
  tags: [
    { value: 'contains', label: 'has tag' },
    { value: 'not_contains', label: 'does not have tag' },
    { value: 'has_any', label: 'has any of' },
    { value: 'has_all', label: 'has all of' },
  ],
  created_date: [
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'last_n_days', label: 'in the last N days' },
  ],
  updated_date: [
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
    { value: 'last_n_days', label: 'in the last N days' },
  ],
};

export function FolderRulesDialog({ folder, isOpen, onClose, onSave }) {
  // Migrate old format rules to new format on load
  const migrateRules = (rules) => {
    if (!rules || rules.length === 0) return [];

    return rules.map((rule) => {
      // If rule doesn't have conditions array, convert old format to new
      if (!rule.conditions) {
        return {
          id: rule.id || Date.now() + Math.random(),
          conditions: [
            {
              id: Date.now() + Math.random(),
              field: rule.field || 'title',
              operator: rule.operator || 'contains',
              value: rule.value || '',
            },
          ],
        };
      }
      return rule;
    });
  };

  // Each rule is now a group of conditions (all must match within a group)
  const [rules, setRules] = useState(migrateRules(folder?.rules || []));
  const [matchType, setMatchType] = useState(folder?.matchType || 'all'); // 'all' or 'any' between rule groups

  if (!isOpen) return null;

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now(),
        conditions: [
          {
            id: Date.now(),
            field: 'title',
            operator: 'contains',
            value: '',
          },
        ],
      },
    ]);
  };

  const addConditionToRule = (ruleId) => {
    setRules(
      rules.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditions: [
              ...rule.conditions,
              {
                id: Date.now() + Math.random(),
                field: 'title',
                operator: 'contains',
                value: '',
              },
            ],
          };
        }
        return rule;
      })
    );
  };

  const updateCondition = (ruleId, conditionId, updates) => {
    setRules(
      rules.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditions: rule.conditions.map((condition) => {
              if (condition.id === conditionId) {
                const newCondition = { ...condition, ...updates };

                // Reset operator if field changes and current operator is not available
                if (updates.field && condition.field !== updates.field) {
                  const availableOperators = RULE_OPERATORS[updates.field] || [];
                  if (!availableOperators.find(op => op.value === condition.operator)) {
                    newCondition.operator = availableOperators[0]?.value || 'contains';
                  }
                }

                return newCondition;
              }
              return condition;
            }),
          };
        }
        return rule;
      })
    );
  };

  const removeCondition = (ruleId, conditionId) => {
    setRules(
      rules.map((rule) => {
        if (rule.id === ruleId) {
          const newConditions = rule.conditions.filter((c) => c.id !== conditionId);
          // If removing the last condition, remove the entire rule
          if (newConditions.length === 0) {
            return null;
          }
          return {
            ...rule,
            conditions: newConditions,
          };
        }
        return rule;
      }).filter(Boolean)
    );
  };

  const removeRule = (id) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleSave = () => {
    onSave({
      rules,
      matchType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-app-bg-secondary border border-border/50 rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-app-text-primary">
              Folder Rules
            </h2>
            <p className="text-sm text-app-text-muted mt-1">
              Define rules to automatically organize notes into this folder
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Match Type */}
        <div className="mb-6">
          <label className="text-sm font-medium text-app-text-primary mb-2 block">
            Match Type
          </label>
          <div className="flex gap-2">
            <Button
              variant={matchType === 'all' ? 'default' : 'outline'}
              onClick={() => setMatchType('all')}
              className="flex-1"
            >
              Match ALL rules (AND)
            </Button>
            <Button
              variant={matchType === 'any' ? 'default' : 'outline'}
              onClick={() => setMatchType('any')}
              className="flex-1"
            >
              Match ANY rule (OR)
            </Button>
          </div>
        </div>

        {/* Rules List */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-app-text-primary">
              Rule Groups ({rules.length})
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={addRule}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Rule Group
            </Button>
          </div>

          {rules.length === 0 ? (
            <div className="border border-dashed border-border/50 rounded-lg p-8 text-center">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-20 text-app-text-muted" />
              <p className="text-sm text-app-text-muted">
                No rules defined yet
              </p>
              <p className="text-xs text-app-text-muted mt-1">
                Click "Add Rule Group" to create your first rule
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule, ruleIndex) => (
                <div
                  key={rule.id}
                  className="border-2 border-primary/20 rounded-lg p-4 bg-app-bg-primary space-y-2"
                >
                  {/* Rule Group Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="flex-shrink-0">
                        Rule {ruleIndex + 1}
                      </Badge>
                      <span className="text-xs text-app-text-muted">
                        {(rule.conditions || []).length > 1
                          ? 'All conditions in this group must match'
                          : 'Single condition'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addConditionToRule(rule.id)}
                        className="gap-1 h-7 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Add Condition
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule(rule.id)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="space-y-2 pl-2">
                    {(rule.conditions || []).map((condition, conditionIndex) => (
                      <div
                        key={condition.id}
                        className="flex items-center gap-2 p-2 bg-app-bg-secondary rounded-lg border border-border/30"
                      >
                        {/* Condition Number */}
                        {(rule.conditions || []).length > 1 && (
                          <Badge variant="secondary" className="flex-shrink-0 h-6 text-xs">
                            {conditionIndex + 1}
                          </Badge>
                        )}

                        {/* Field Selector */}
                        <select
                          value={condition.field}
                          onChange={(e) =>
                            updateCondition(rule.id, condition.id, { field: e.target.value })
                          }
                          className="text-sm bg-app-bg-primary border border-input-border rounded-md px-3 py-1.5 text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {RULE_FIELDS.map((field) => (
                            <option key={field.value} value={field.value}>
                              {field.label}
                            </option>
                          ))}
                        </select>

                        {/* Operator Selector */}
                        <select
                          value={condition.operator}
                          onChange={(e) =>
                            updateCondition(rule.id, condition.id, { operator: e.target.value })
                          }
                          className="text-sm bg-app-bg-primary border border-input-border rounded-md px-3 py-1.5 text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0"
                        >
                          {(RULE_OPERATORS[condition.field] || []).map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        {/* Value Input */}
                        <Input
                          type={
                            condition.field.includes('date') &&
                            !condition.operator.includes('last_n_days')
                              ? 'date'
                              : condition.operator === 'last_n_days'
                              ? 'number'
                              : 'text'
                          }
                          placeholder={
                            condition.operator === 'last_n_days'
                              ? 'Enter number of days'
                              : condition.field === 'tags'
                              ? 'Enter tag name or comma-separated tags'
                              : 'Enter value...'
                          }
                          value={condition.value}
                          onChange={(e) =>
                            updateCondition(rule.id, condition.id, { value: e.target.value })
                          }
                          className="flex-1 bg-app-bg-primary border-input-border"
                        />

                        {/* Remove Condition Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCondition(rule.id, condition.id)}
                          className="flex-shrink-0 h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Info */}
        {rules.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold mb-2">
              How notes will be matched:
            </p>
            {matchType === 'all' ? (
              <div className="text-xs text-blue-600 dark:text-blue-500 space-y-1">
                <p>✓ A note must match <strong>ALL {rules.length} rule group{rules.length !== 1 ? 's' : ''}</strong></p>
                <p className="ml-3">• Within each group, ALL conditions must be satisfied</p>
                <p className="ml-3 italic">Example: If you have 2 groups, a note must satisfy both Group 1 AND Group 2</p>
              </div>
            ) : (
              <div className="text-xs text-blue-600 dark:text-blue-500 space-y-1">
                <p>✓ A note only needs to match <strong>ANY ONE</strong> of the {rules.length} rule group{rules.length !== 1 ? 's' : ''}</p>
                <p className="ml-3">• Within each group, ALL conditions must be satisfied</p>
                <p className="ml-3 italic">Example: If you have 2 groups, a note can match Group 1 OR Group 2</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Rules</Button>
        </div>
      </div>
    </div>
  );
}
