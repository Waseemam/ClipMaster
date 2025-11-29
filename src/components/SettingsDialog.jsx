import { useState, useEffect } from 'react';
import { X, Key, Sparkles, Save, Palette, Paintbrush, RotateCcw, HardDrive, Trash2, Monitor, Plus, Minus, Keyboard } from 'lucide-react';
import { loadSettings, saveSettings } from '@/lib/settings';
import { Button } from './ui/button';
import { Input } from './ui/input';

// Complete theme presets with ALL colors
const PRESET_THEMES = [
  {
    name: 'Dark Red',
    mode: 'dark',
    colors: {
      bgPrimary: '#36393f',
      bgSecondary: '#2f3136',
      bgTertiary: '#202225',
      textPrimary: '#dcddde',
      textSecondary: '#b9bbbe',
      textMuted: '#72767d',
      accent: '#ef4444',
      border: '#202225',
    }
  },
  {
    name: 'Light Red',
    mode: 'light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f7f8fa',
      bgTertiary: '#ebedef',
      textPrimary: '#2e3338',
      textSecondary: '#5c6370',
      textMuted: '#8a8f98',
      accent: '#ef4444',
      border: '#e5e7eb',
    }
  },
  {
    name: 'Dark Blue',
    mode: 'dark',
    colors: {
      bgPrimary: '#1e293b',
      bgSecondary: '#0f172a',
      bgTertiary: '#020617',
      textPrimary: '#e2e8f0',
      textSecondary: '#cbd5e1',
      textMuted: '#64748b',
      accent: '#3b82f6',
      border: '#1e293b',
    }
  },
  {
    name: 'Light Blue',
    mode: 'light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#eff6ff',
      bgTertiary: '#dbeafe',
      textPrimary: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      accent: '#3b82f6',
      border: '#e0e7ff',
    }
  },
  {
    name: 'Dark Green',
    mode: 'dark',
    colors: {
      bgPrimary: '#1a2e1a',
      bgSecondary: '#0f1f0f',
      bgTertiary: '#071207',
      textPrimary: '#d1fae5',
      textSecondary: '#a7f3d0',
      textMuted: '#6ee7b7',
      accent: '#10b981',
      border: '#1a2e1a',
    }
  },
  {
    name: 'Light Green',
    mode: 'light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f0fdf4',
      bgTertiary: '#dcfce7',
      textPrimary: '#14532d',
      textSecondary: '#166534',
      textMuted: '#15803d',
      accent: '#10b981',
      border: '#bbf7d0',
    }
  },
  {
    name: 'Dark Purple',
    mode: 'dark',
    colors: {
      bgPrimary: '#2e1a47',
      bgSecondary: '#1f0f3d',
      bgTertiary: '#120729',
      textPrimary: '#f3e8ff',
      textSecondary: '#e9d5ff',
      textMuted: '#d8b4fe',
      accent: '#a855f7',
      border: '#2e1a47',
    }
  },
  {
    name: 'Light Purple',
    mode: 'light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#faf5ff',
      bgTertiary: '#f3e8ff',
      textPrimary: '#581c87',
      textSecondary: '#6b21a8',
      textMuted: '#7e22ce',
      accent: '#a855f7',
      border: '#e9d5ff',
    }
  },
  {
    name: 'Dark Ocean',
    mode: 'dark',
    colors: {
      bgPrimary: '#164e63',
      bgSecondary: '#083344',
      bgTertiary: '#022c3d',
      textPrimary: '#ecfeff',
      textSecondary: '#cffafe',
      textMuted: '#a5f3fc',
      accent: '#06b6d4',
      border: '#164e63',
    }
  },
  {
    name: 'Light Ocean',
    mode: 'light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#ecfeff',
      bgTertiary: '#cffafe',
      textPrimary: '#164e63',
      textSecondary: '#0e7490',
      textMuted: '#0891b2',
      accent: '#06b6d4',
      border: '#a5f3fc',
    }
  },
  {
    name: 'Dark Orange',
    mode: 'dark',
    colors: {
      bgPrimary: '#431407',
      bgSecondary: '#7c2d12',
      bgTertiary: '#1c0a05',
      textPrimary: '#ffedd5',
      textSecondary: '#fed7aa',
      textMuted: '#fdba74',
      accent: '#f97316',
      border: '#431407',
    }
  },
  {
    name: 'Light Orange',
    mode: 'light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#fff7ed',
      bgTertiary: '#ffedd5',
      textPrimary: '#7c2d12',
      textSecondary: '#9a3412',
      textMuted: '#c2410c',
      accent: '#f97316',
      border: '#fed7aa',
    }
  },
];

export function SettingsDialog({ isOpen, onClose, onThemeChange }) {
  const [settings, setSettings] = useState({
    apiKey: '',
    model: 'gpt-5-nano',
    themeMode: 'dark',
    customTheme: {
      bgPrimary: '#36393f',
      bgSecondary: '#2f3136',
      bgTertiary: '#202225',
      textPrimary: '#dcddde',
      textSecondary: '#b9bbbe',
      textMuted: '#72767d',
      accent: '#ef4444',
      border: '#202225',
    }
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('theme');
  const [contextMenuStatus, setContextMenuStatus] = useState('checking');
  const [contextMenuMessage, setContextMenuMessage] = useState(''); // 'theme' or 'ai'

  useEffect(() => {
    if (isOpen) {
      const loaded = loadSettings();
      setSettings(loaded);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings(settings);

    // Apply theme immediately
    if (onThemeChange) {
      onThemeChange(settings.customTheme, settings.themeMode);
    }

    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setSettings({
      ...settings,
      apiKey: '',
      model: 'gpt-5-nano',
    });
  };

  const handlePresetTheme = (theme) => {
    const newSettings = {
      ...settings,
      themeMode: theme.mode,
      customTheme: theme.colors,
    };
    setSettings(newSettings);

    // Apply theme immediately for preview
    if (onThemeChange) {
      onThemeChange(theme.colors, theme.mode);
    }
  };

  const handleColorChange = (colorKey, value) => {
    const newTheme = {
      ...settings.customTheme,
      [colorKey]: value,
    };
    const newSettings = {
      ...settings,
      customTheme: newTheme,
    };
    setSettings(newSettings);

    // Apply immediately for live preview
    if (onThemeChange) {
      onThemeChange(newTheme, settings.themeMode);
    }
  };

  const resetToDefault = () => {
    const defaultTheme = PRESET_THEMES[0]; // Dark Red
    handlePresetTheme(defaultTheme);
  };

  if (!isOpen) return null;

  const theme = settings.customTheme || {
    bgPrimary: '#36393f',
    bgSecondary: '#2f3136',
    bgTertiary: '#202225',
    textPrimary: '#dcddde',
    textSecondary: '#b9bbbe',
    textMuted: '#72767d',
    accent: '#ef4444',
    border: '#202225',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.bgPrimary }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: theme.textPrimary }}
          >
            <Sparkles className="w-5 h-5" style={{ color: theme.accent }} />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: theme.textSecondary }}
            onMouseEnter={(e) => e.target.style.color = theme.textPrimary}
            onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.bgSecondary
          }}
        >
          <button
            onClick={() => setActiveTab('theme')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2"
            style={{
              color: activeTab === 'theme' ? theme.textPrimary : theme.textSecondary,
              borderBottomColor: activeTab === 'theme' ? theme.accent : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'theme') {
                e.target.style.color = theme.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'theme') {
                e.target.style.color = theme.textSecondary;
              }
            }}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Theme
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2"
            style={{
              color: activeTab === 'ai' ? theme.textPrimary : theme.textSecondary,
              borderBottomColor: activeTab === 'ai' ? theme.accent : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'ai') {
                e.target.style.color = theme.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'ai') {
                e.target.style.color = theme.textSecondary;
              }
            }}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            AI Settings
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2"
            style={{
              color: activeTab === 'storage' ? theme.textPrimary : theme.textSecondary,
              borderBottomColor: activeTab === 'storage' ? theme.accent : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'storage') {
                e.target.style.color = theme.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'storage') {
                e.target.style.color = theme.textSecondary;
              }
            }}
          >
            <HardDrive className="w-4 h-4 inline mr-2" />
            Storage
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2"
            style={{
              color: activeTab === 'system' ? theme.textPrimary : theme.textSecondary,
              borderBottomColor: activeTab === 'system' ? theme.accent : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'system') {
                e.target.style.color = theme.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'system') {
                e.target.style.color = theme.textSecondary;
              }
            }}
          >
            <Monitor className="w-4 h-4 inline mr-2" />
            System
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2"
            style={{
              color: activeTab === 'shortcuts' ? theme.textPrimary : theme.textSecondary,
              borderBottomColor: activeTab === 'shortcuts' ? theme.accent : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'shortcuts') {
                e.target.style.color = theme.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'shortcuts') {
                e.target.style.color = theme.textSecondary;
              }
            }}
          >
            <Keyboard className="w-4 h-4 inline mr-2" />
            Shortcuts
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Mode Indicator */}
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: theme.textPrimary }}
                  >
                    Current Mode
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: theme.textMuted }}
                  >
                    Theme appearance
                  </p>
                </div>
                <div
                  className="px-4 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  {settings.themeMode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </div>
              </div>

              {/* Preset Themes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" style={{ color: theme.accent }} />
                    <label
                      className="text-sm font-medium"
                      style={{ color: theme.textPrimary }}
                    >
                      Preset Themes
                    </label>
                  </div>
                  <button
                    onClick={resetToDefault}
                    className="text-xs flex items-center gap-1 transition-colors"
                    style={{ color: theme.textMuted }}
                    onMouseEnter={(e) => e.target.style.color = theme.textPrimary}
                    onMouseLeave={(e) => e.target.style.color = theme.textMuted}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_THEMES.map((presetTheme) => {
                    const isActive = JSON.stringify(settings.customTheme) === JSON.stringify(presetTheme.colors);
                    return (
                      <button
                        key={presetTheme.name}
                        onClick={() => handlePresetTheme(presetTheme)}
                        className="relative p-3 rounded-lg border-2 transition-all hover:scale-105"
                        style={{
                          backgroundColor: presetTheme.colors.bgSecondary,
                          borderColor: isActive ? '#ffffff' : theme.border,
                          boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.target.style.borderColor = theme.textMuted;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.target.style.borderColor = theme.border;
                          }
                        }}
                      >
                        {/* Theme Preview */}
                        <div className="space-y-2 mb-2">
                          <div
                            className="h-8 rounded flex items-center justify-center text-xs font-medium"
                            style={{
                              backgroundColor: presetTheme.colors.accent,
                              color: '#ffffff'
                            }}
                          >
                            Button
                          </div>
                          <div
                            className="h-6 rounded"
                            style={{ backgroundColor: presetTheme.colors.bgPrimary }}
                          />
                          <div
                            className="h-4 rounded"
                            style={{ backgroundColor: presetTheme.colors.bgTertiary }}
                          />
                        </div>
                        <p
                          className="text-xs font-medium text-center"
                          style={{ color: presetTheme.colors.textPrimary }}
                        >
                          {presetTheme.name}
                        </p>
                        <p
                          className="text-[10px] text-center mt-1"
                          style={{ color: presetTheme.colors.textMuted }}
                        >
                          {presetTheme.mode === 'dark' ? '🌙' : '☀️'}
                        </p>
                        {isActive && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div
                className="space-y-4 pt-4 border-t"
                style={{ borderColor: theme.border }}
              >
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4" style={{ color: theme.accent }} />
                  <label
                    className="text-sm font-medium"
                    style={{ color: theme.textPrimary }}
                  >
                    Custom Colors
                  </label>
                  <span
                    className="text-xs"
                    style={{ color: theme.textMuted }}
                  >
                    (Advanced)
                  </span>
                </div>

                {/* Color Pickers Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Background Primary */}
                  <div className="space-y-2">
                    <label
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Background Primary
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.bgPrimary}
                        onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2"
                        style={{ borderColor: theme.border }}
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.bgPrimary}
                        onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                        className="flex-1 uppercase font-mono text-xs"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      />
                    </div>
                  </div>

                  {/* Background Secondary */}
                  <div className="space-y-2">
                    <label
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Background Secondary
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.bgSecondary}
                        onChange={(e) => handleColorChange('bgSecondary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2"
                        style={{ borderColor: theme.border }}
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.bgSecondary}
                        onChange={(e) => handleColorChange('bgSecondary', e.target.value)}
                        className="flex-1 uppercase font-mono text-xs"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      />
                    </div>
                  </div>

                  {/* Background Tertiary */}
                  <div className="space-y-2">
                    <label
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Background Tertiary
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.bgTertiary}
                        onChange={(e) => handleColorChange('bgTertiary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2"
                        style={{ borderColor: theme.border }}
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.bgTertiary}
                        onChange={(e) => handleColorChange('bgTertiary', e.target.value)}
                        className="flex-1 uppercase font-mono text-xs"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-2">
                    <label
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Accent Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2"
                        style={{ borderColor: theme.border }}
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 uppercase font-mono text-xs"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      />
                    </div>
                  </div>

                  {/* Text Primary */}
                  <div className="space-y-2">
                    <label
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Text Primary
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.textPrimary}
                        onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2"
                        style={{ borderColor: theme.border }}
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.textPrimary}
                        onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                        className="flex-1 uppercase font-mono text-xs"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      />
                    </div>
                  </div>

                  {/* Text Secondary */}
                  <div className="space-y-2">
                    <label
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Text Secondary
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.textSecondary}
                        onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2"
                        style={{ borderColor: theme.border }}
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.textSecondary}
                        onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                        className="flex-1 uppercase font-mono text-xs"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      />
                    </div>
                  </div>

                  {/* Text Muted */}
                  <div className="space-y-2">
                    <label
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Text Muted
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.textMuted}
                        onChange={(e) => handleColorChange('textMuted', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2"
                        style={{ borderColor: theme.border }}
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.textMuted}
                        onChange={(e) => handleColorChange('textMuted', e.target.value)}
                        className="flex-1 uppercase font-mono text-xs"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      />
                    </div>
                  </div>

                  {/* Border Color */}
                  <div className="space-y-2">
                    <label
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Border Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.border}
                        onChange={(e) => handleColorChange('border', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2"
                        style={{ borderColor: theme.border }}
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.border}
                        onChange={(e) => handleColorChange('border', e.target.value)}
                        className="flex-1 uppercase font-mono text-xs"
                        style={{
                          backgroundColor: theme.bgSecondary,
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p
                  className="text-xs mt-4"
                  style={{ color: theme.textMuted }}
                >
                  💡 <strong>Tip:</strong> Pick any preset theme and tweak individual colors, or create your own from scratch!
                </p>
              </div>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* API Key Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" style={{ color: theme.accent }} />
                  <label
                    className="text-sm font-medium"
                    style={{ color: theme.textPrimary }}
                  >
                    OpenAI API Key (Optional)
                  </label>
                </div>
                <Input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-proj-... (leave empty to use default)"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                    color: theme.textPrimary
                  }}
                  className="placeholder:opacity-50"
                />
                <p
                  className="text-xs"
                  style={{ color: theme.textMuted }}
                >
                  Leave empty to use the app's built-in API key. Enter your own key to use your OpenAI account instead.
                </p>
              </div>

              {/* Model Section */}
              <div className="space-y-3">
                <label
                  className="text-sm font-medium"
                  style={{ color: theme.textPrimary }}
                >
                  AI Model
                </label>
                <Input
                  type="text"
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  placeholder="gpt-5-nano"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                    color: theme.textPrimary
                  }}
                />
                <p
                  className="text-xs"
                  style={{ color: theme.textMuted }}
                >
                  The AI model to use for processing notes.
                </p>
                <p
                  className="text-xs"
                  style={{ color: theme.textMuted }}
                >
                  Recommended: gpt-5-nano, gpt-4o-mini, or gpt-4o
                </p>
              </div>

              {/* Info Box */}
              <div
                className="border rounded p-3"
                style={{
                  backgroundColor: theme.accent + '10',
                  borderColor: theme.accent + '30'
                }}
              >
                <p
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  <strong>Note:</strong> If you provide your own API key, you'll be charged by OpenAI based on your usage. The app includes a default key that works out of the box.
                </p>
              </div>
            </div>
          )}

          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" style={{ color: theme.accent }} />
                  <h3
                    className="text-lg font-medium"
                    style={{ color: theme.textPrimary }}
                  >
                    Storage Management
                  </h3>
                </div>

                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4
                        className="text-sm font-medium mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        Clean Unused Images
                      </h4>
                      <p
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        Scan all notes and delete images that are no longer referenced. This helps free up disk space.
                      </p>
                    </div>
                    <Button
                      onClick={async () => {
                        try {
                          const result = await window.electronAPI.cleanupImages();
                          if (result.success) {
                            alert(`Cleanup complete! Deleted ${result.count} unused images.`);
                          } else {
                            alert('Cleanup failed: ' + result.error);
                          }
                        } catch (error) {
                          console.error('Cleanup error:', error);
                          alert('Failed to run cleanup');
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      style={{
                        borderColor: theme.border,
                        color: theme.textPrimary
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3
                  className="text-base font-semibold mb-4"
                  style={{ color: theme.textPrimary }}
                >
                  Windows Integration
                </h3>

                {/* Context Menu Integration */}
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <h4
                        className="text-sm font-medium mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        Right-Click Context Menu
                      </h4>
                      <p
                        className="text-xs mb-3"
                        style={{ color: theme.textMuted }}
                      >
                        Add "Create New Note in ClipMaster" to the Windows right-click context menu. Right-click anywhere in File Explorer to quickly create a new note.
                      </p>
                    </div>

                    {contextMenuMessage && (
                      <div
                        className="p-3 rounded text-xs"
                        style={{
                          backgroundColor: contextMenuStatus === 'success' ? '#10b98120' : contextMenuStatus === 'error' ? '#ef444420' : theme.bgTertiary,
                          color: contextMenuStatus === 'success' ? '#10b981' : contextMenuStatus === 'error' ? '#ef4444' : theme.textSecondary
                        }}
                      >
                        {contextMenuMessage}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            setContextMenuMessage('Installing context menu...');
                            setContextMenuStatus('checking');
                            const result = await window.electronAPI.installContextMenu();
                            if (result.success) {
                              setContextMenuMessage('✓ Context menu installed successfully! Right-click in File Explorer to try it.');
                              setContextMenuStatus('success');
                            } else {
                              setContextMenuMessage('Failed: ' + result.error);
                              setContextMenuStatus('error');
                            }
                          } catch (error) {
                            console.error('Install error:', error);
                            setContextMenuMessage('Failed to install context menu');
                            setContextMenuStatus('error');
                          }
                        }}
                        variant="outline"
                        size="sm"
                        style={{
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Install Context Menu
                      </Button>

                      <Button
                        onClick={async () => {
                          try {
                            setContextMenuMessage('Uninstalling context menu...');
                            setContextMenuStatus('checking');
                            const result = await window.electronAPI.uninstallContextMenu();
                            if (result.success) {
                              setContextMenuMessage('✓ Context menu uninstalled successfully.');
                              setContextMenuStatus('success');
                            } else {
                              setContextMenuMessage('Failed: ' + result.error);
                              setContextMenuStatus('error');
                            }
                          } catch (error) {
                            console.error('Uninstall error:', error);
                            setContextMenuMessage('Failed to uninstall context menu');
                            setContextMenuStatus('error');
                          }
                        }}
                        variant="outline"
                        size="sm"
                        style={{
                          borderColor: theme.border,
                          color: theme.textPrimary
                        }}
                      >
                        <Minus className="w-4 h-4 mr-2" />
                        Uninstall Context Menu
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="w-5 h-5" style={{ color: theme.accent }} />
                <h3
                  className="text-lg font-medium"
                  style={{ color: theme.textPrimary }}
                >
                  AI Tool Keyboard Shortcuts
                </h3>
              </div>

              <p
                className="text-sm mb-4"
                style={{ color: theme.textMuted }}
              >
                Customize keyboard shortcuts for AI-powered tools in the editor.
              </p>

              <div className="space-y-4">
                {/* Fix Text Shortcut */}
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4
                        className="text-sm font-medium mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        Fix & Improve Text
                      </h4>
                      <p
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        Automatically fix grammar and improve writing
                      </p>
                    </div>
                    <Input
                      type="text"
                      value={settings.shortcuts?.fixText || 'Ctrl+Shift+F'}
                      onChange={(e) => setSettings({
                        ...settings,
                        shortcuts: { ...settings.shortcuts, fixText: e.target.value }
                      })}
                      className="w-40 text-center font-mono text-sm"
                      style={{
                        backgroundColor: theme.bgPrimary,
                        borderColor: theme.border,
                        color: theme.textPrimary
                      }}
                      placeholder="e.g. Ctrl+Shift+F"
                    />
                  </div>
                </div>

                {/* Format Text Shortcut */}
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4
                        className="text-sm font-medium mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        Auto Format HTML
                      </h4>
                      <p
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        Format and structure your content
                      </p>
                    </div>
                    <Input
                      type="text"
                      value={settings.shortcuts?.formatText || 'Ctrl+Shift+H'}
                      onChange={(e) => setSettings({
                        ...settings,
                        shortcuts: { ...settings.shortcuts, formatText: e.target.value }
                      })}
                      className="w-40 text-center font-mono text-sm"
                      style={{
                        backgroundColor: theme.bgPrimary,
                        borderColor: theme.border,
                        color: theme.textPrimary
                      }}
                      placeholder="e.g. Ctrl+Shift+H"
                    />
                  </div>
                </div>

                {/* Summarize Shortcut */}
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4
                        className="text-sm font-medium mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        Summarize Note
                      </h4>
                      <p
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        Generate a summary of your note
                      </p>
                    </div>
                    <Input
                      type="text"
                      value={settings.shortcuts?.summarize || 'Ctrl+Shift+S'}
                      onChange={(e) => setSettings({
                        ...settings,
                        shortcuts: { ...settings.shortcuts, summarize: e.target.value }
                      })}
                      className="w-40 text-center font-mono text-sm"
                      style={{
                        backgroundColor: theme.bgPrimary,
                        borderColor: theme.border,
                        color: theme.textPrimary
                      }}
                      placeholder="e.g. Ctrl+Shift+S"
                    />
                  </div>
                </div>

                {/* Auto Tags Shortcut */}
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4
                        className="text-sm font-medium mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        Auto Title & Tags
                      </h4>
                      <p
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        Generate title and tags automatically
                      </p>
                    </div>
                    <Input
                      type="text"
                      value={settings.shortcuts?.autoTags || 'Ctrl+Shift+T'}
                      onChange={(e) => setSettings({
                        ...settings,
                        shortcuts: { ...settings.shortcuts, autoTags: e.target.value }
                      })}
                      className="w-40 text-center font-mono text-sm"
                      style={{
                        backgroundColor: theme.bgPrimary,
                        borderColor: theme.border,
                        color: theme.textPrimary
                      }}
                      placeholder="e.g. Ctrl+Shift+T"
                    />
                  </div>
                </div>
              </div>

              <div
                className="p-3 rounded text-xs mt-4"
                style={{
                  backgroundColor: theme.bgTertiary,
                  color: theme.textMuted
                }}
              >
                <strong>Tip:</strong> Use combinations like Ctrl+Shift+Letter, Ctrl+Alt+Letter, or Alt+Shift+Letter. Changes take effect after saving.
              </div>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div
              className="mt-6 border rounded p-3"
              style={{
                backgroundColor: '#10b981' + '10',
                borderColor: '#10b981' + '30'
              }}
            >
              <p
                className="text-sm text-center"
                style={{ color: '#10b981' }}
              >
                ✓ Settings saved successfully!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 p-4 border-t"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.bgSecondary
          }}
        >
          {activeTab === 'ai' && (
            <Button
              onClick={handleClear}
              variant="ghost"
              className="transition-colors"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => e.target.style.color = theme.textPrimary}
              onMouseLeave={(e) => e.target.style.color = theme.textMuted}
            >
              Clear AI Settings
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            className="transition-colors"
            style={{ color: theme.textMuted }}
            onMouseEnter={(e) => e.target.style.color = theme.textPrimary}
            onMouseLeave={(e) => e.target.style.color = theme.textMuted}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="text-white transition-all hover:opacity-90"
            style={{ backgroundColor: theme.accent }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
