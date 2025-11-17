/**
 * Settings management for ClipMaster
 * Handles user preferences and API key configuration
 */

const SETTINGS_KEY = 'clipmaster_settings';

// Default settings structure
const defaultSettings = {
  apiKey: '', // User's custom API key (empty = use embedded key)
  model: 'gpt-5-nano',
  theme: 'dark',
  themeColor: '#ef4444', // Light mode primary color (Red by default)
  themeColorDark: '#dc2626', // Dark mode primary color (Darker Red by default)
};

/**
 * Load settings from localStorage
 */
export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

/**
 * Get the API key to use (user's custom key or embedded default)
 */
export function getApiKey() {
  const settings = loadSettings();
  // Use user's custom key if provided, otherwise use embedded key
  return settings.apiKey || process.env.OPENAI_API_KEY || '';
}

/**
 * Get the model to use
 */
export function getModel() {
  const settings = loadSettings();
  return settings.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

/**
 * Clear all settings (reset to defaults)
 */
export function clearSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear settings:', error);
    return false;
  }
}

