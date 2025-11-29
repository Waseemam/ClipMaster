/**
 * Evaluates if a note matches a single rule
 */
function evaluateRule(note, rule) {
  const { field, operator, value } = rule;

  if (!value && operator !== 'has_any' && operator !== 'has_all') {
    return false; // Empty value doesn't match anything
  }

  switch (field) {
    case 'title':
      return evaluateStringRule(note.title || '', operator, value);

    case 'content':
      // Extract plain text from HTML content
      const plainText = getPlainText(note.content || '');
      return evaluateStringRule(plainText, operator, value);

    case 'tags':
      return evaluateTagsRule(note.tags || [], operator, value);

    case 'created_date':
      return evaluateDateRule(note.created_at || note.createdAt, operator, value);

    case 'updated_date':
      return evaluateDateRule(note.updated_at || note.updatedAt, operator, value);

    default:
      return false;
  }
}

/**
 * Helper to extract plain text from HTML
 */
function getPlainText(html) {
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  // Fallback for non-browser environments
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Evaluate string-based rules
 */
function evaluateStringRule(text, operator, value) {
  const lowerText = text.toLowerCase();
  const lowerValue = value.toLowerCase();

  switch (operator) {
    case 'contains':
      return lowerText.includes(lowerValue);
    case 'not_contains':
      return !lowerText.includes(lowerValue);
    case 'starts_with':
      return lowerText.startsWith(lowerValue);
    case 'ends_with':
      return lowerText.endsWith(lowerValue);
    case 'equals':
      return lowerText === lowerValue;
    case 'not_equals':
      return lowerText !== lowerValue;
    default:
      return false;
  }
}

/**
 * Evaluate tags-based rules
 */
function evaluateTagsRule(tags, operator, value) {
  // Parse comma-separated tags
  const searchTags = value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  const noteTags = tags.map(t => t.toLowerCase());

  switch (operator) {
    case 'contains':
      // Has specific tag
      return searchTags.some(tag => noteTags.includes(tag));
    case 'not_contains':
      // Doesn't have specific tag
      return !searchTags.some(tag => noteTags.includes(tag));
    case 'has_any':
      // Has any of the tags
      return searchTags.some(tag => noteTags.includes(tag));
    case 'has_all':
      // Has all of the tags
      return searchTags.every(tag => noteTags.includes(tag));
    default:
      return false;
  }
}

/**
 * Evaluate date-based rules
 */
function evaluateDateRule(dateString, operator, value) {
  if (!dateString) return false;

  const noteDate = new Date(dateString);
  const now = new Date();

  switch (operator) {
    case 'before':
      const beforeDate = new Date(value);
      return noteDate < beforeDate;

    case 'after':
      const afterDate = new Date(value);
      return noteDate > afterDate;

    case 'last_n_days':
      const daysAgo = parseInt(value);
      if (isNaN(daysAgo)) return false;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      return noteDate >= cutoffDate;

    default:
      return false;
  }
}

/**
 * Evaluates if a note matches a single rule group (all conditions must match)
 * @param {Object} note - The note to evaluate
 * @param {Object} ruleGroup - The rule group with conditions
 * @returns {boolean} - Whether the note matches all conditions
 */
function evaluateRuleGroup(note, ruleGroup) {
  // Support both old format (single condition) and new format (conditions array)
  if (ruleGroup.conditions) {
    // New format: all conditions in the group must match
    return ruleGroup.conditions.every(condition => evaluateRule(note, condition));
  } else {
    // Old format: treat as single condition
    return evaluateRule(note, ruleGroup);
  }
}

/**
 * Evaluates if a note matches a folder's rules
 * @param {Object} note - The note to evaluate
 * @param {Object} folder - The folder with rules
 * @returns {boolean} - Whether the note matches
 */
export function noteMatchesFolderRules(note, folder) {
  if (!folder.rules || folder.rules.length === 0) {
    return false; // No rules = no match for dynamic folders
  }

  const matchType = folder.matchType || 'all';

  if (matchType === 'all') {
    // ALL rule groups must match (AND)
    return folder.rules.every(ruleGroup => evaluateRuleGroup(note, ruleGroup));
  } else {
    // ANY rule group must match (OR)
    return folder.rules.some(ruleGroup => evaluateRuleGroup(note, ruleGroup));
  }
}

/**
 * Gets all notes that match a dynamic folder's rules
 * @param {Array} notes - All notes
 * @param {Object} folder - The folder with rules
 * @returns {Array} - Matching notes
 */
export function getNotesForDynamicFolder(notes, folder) {
  if (folder.type !== 'dynamic' && folder.type !== 'hybrid') {
    // For manual folders, return notes explicitly assigned to this folder
    return notes.filter(note => note.folder_id === folder.id || note.folderId === folder.id);
  }

  if (folder.type === 'dynamic') {
    // Pure dynamic: only return notes that match rules
    return notes.filter(note => noteMatchesFolderRules(note, folder));
  }

  if (folder.type === 'hybrid') {
    // Hybrid: return notes that match rules OR are manually assigned
    return notes.filter(note => {
      const isManuallyAssigned = note.folder_id === folder.id || note.folderId === folder.id;
      const matchesRules = noteMatchesFolderRules(note, folder);
      return isManuallyAssigned || matchesRules;
    });
  }

  return [];
}
