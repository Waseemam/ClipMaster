import { useState, useEffect } from 'react';
import { X, Key, Sparkles, Save, Palette, Paintbrush, RotateCcw } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('theme'); // 'theme' or 'ai'

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#36393f] rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#202225]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: settings.customTheme.accent }} />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#202225] bg-[#2f3136]">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'theme'
                ? 'text-white border-b-2'
                : 'text-gray-400 hover:text-white'
            }`}
            style={activeTab === 'theme' ? { borderBottomColor: settings.customTheme.accent } : {}}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Theme
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'ai'
                ? 'text-white border-b-2'
                : 'text-gray-400 hover:text-white'
            }`}
            style={activeTab === 'ai' ? { borderBottomColor: settings.customTheme.accent } : {}}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            AI Settings
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Mode Indicator */}
              <div className="flex items-center justify-between p-4 bg-[#40444b] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Current Mode</p>
                  <p className="text-xs text-gray-400">Theme appearance</p>
                </div>
                <div className="px-4 py-2 rounded-lg font-medium text-white" style={{ backgroundColor: settings.customTheme.accent }}>
                  {settings.themeMode === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </div>
              </div>

              {/* Preset Themes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" style={{ color: settings.customTheme.accent }} />
                    <label className="text-sm font-medium text-white">
                      Preset Themes
                    </label>
                  </div>
                  <button
                    onClick={resetToDefault}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_THEMES.map((theme) => {
                    const isActive = JSON.stringify(settings.customTheme) === JSON.stringify(theme.colors);
                    return (
                      <button
                        key={theme.name}
                        onClick={() => handlePresetTheme(theme)}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all hover:scale-105
                          ${isActive
                            ? 'border-white shadow-lg'
                            : 'border-[#202225] hover:border-gray-600'
                          }
                        `}
                        style={{ backgroundColor: theme.colors.bgSecondary }}
                      >
                        {/* Theme Preview */}
                        <div className="space-y-2 mb-2">
                          <div 
                            className="h-8 rounded flex items-center justify-center text-xs font-medium"
                            style={{ 
                              backgroundColor: theme.colors.accent,
                              color: '#ffffff'
                            }}
                          >
                            Button
                          </div>
                          <div 
                            className="h-6 rounded"
                            style={{ backgroundColor: theme.colors.bgPrimary }}
                          />
                          <div 
                            className="h-4 rounded"
                            style={{ backgroundColor: theme.colors.bgTertiary }}
                          />
                        </div>
                        <p className="text-xs font-medium text-center" style={{ color: theme.colors.textPrimary }}>
                          {theme.name}
                        </p>
                        <p className="text-[10px] text-center mt-1" style={{ color: theme.colors.textMuted }}>
                          {theme.mode === 'dark' ? '🌙' : '☀️'}
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
              <div className="space-y-4 pt-4 border-t border-[#202225]">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4" style={{ color: settings.customTheme.accent }} />
                  <label className="text-sm font-medium text-white">
                    Custom Colors
                  </label>
                  <span className="text-xs text-gray-400">(Advanced)</span>
                </div>

                {/* Color Pickers Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Background Primary */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Background Primary</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.bgPrimary}
                        onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2 border-[#202225]"
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.bgPrimary}
                        onChange={(e) => handleColorChange('bgPrimary', e.target.value)}
                        className="flex-1 bg-[#40444b] border-[#202225] text-white uppercase font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Background Secondary */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Background Secondary</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.bgSecondary}
                        onChange={(e) => handleColorChange('bgSecondary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2 border-[#202225]"
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.bgSecondary}
                        onChange={(e) => handleColorChange('bgSecondary', e.target.value)}
                        className="flex-1 bg-[#40444b] border-[#202225] text-white uppercase font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Background Tertiary */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Background Tertiary</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.bgTertiary}
                        onChange={(e) => handleColorChange('bgTertiary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2 border-[#202225]"
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.bgTertiary}
                        onChange={(e) => handleColorChange('bgTertiary', e.target.value)}
                        className="flex-1 bg-[#40444b] border-[#202225] text-white uppercase font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Accent Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2 border-[#202225]"
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 bg-[#40444b] border-[#202225] text-white uppercase font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Text Primary */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Text Primary</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.textPrimary}
                        onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2 border-[#202225]"
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.textPrimary}
                        onChange={(e) => handleColorChange('textPrimary', e.target.value)}
                        className="flex-1 bg-[#40444b] border-[#202225] text-white uppercase font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Text Secondary */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Text Secondary</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.textSecondary}
                        onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2 border-[#202225]"
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.textSecondary}
                        onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                        className="flex-1 bg-[#40444b] border-[#202225] text-white uppercase font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Text Muted */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Text Muted</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.textMuted}
                        onChange={(e) => handleColorChange('textMuted', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2 border-[#202225]"
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.textMuted}
                        onChange={(e) => handleColorChange('textMuted', e.target.value)}
                        className="flex-1 bg-[#40444b] border-[#202225] text-white uppercase font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Border Color */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Border Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={settings.customTheme.border}
                        onChange={(e) => handleColorChange('border', e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer border-2 border-[#202225]"
                      />
                      <Input
                        type="text"
                        value={settings.customTheme.border}
                        onChange={(e) => handleColorChange('border', e.target.value)}
                        className="flex-1 bg-[#40444b] border-[#202225] text-white uppercase font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
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
                  <Key className="w-4 h-4" style={{ color: settings.customTheme.accent }} />
                  <label className="text-sm font-medium text-white">
                    OpenAI API Key (Optional)
                  </label>
                </div>
                <Input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-proj-... (leave empty to use default)"
                  className="bg-[#40444b] border-[#202225] text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-400">
                  Leave empty to use the app's built-in API key. Enter your own key to use your OpenAI account instead.
                </p>
              </div>

              {/* Model Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">
                  AI Model
                </label>
                <Input
                  type="text"
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  placeholder="gpt-5-nano"
                  className="bg-[#40444b] border-[#202225] text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-400">
                  Recommended: gpt-5-nano, gpt-4o-mini, or gpt-4o
                </p>
              </div>

              {/* Info Box */}
              <div className="border rounded p-3" style={{ 
                backgroundColor: settings.customTheme.accent + '10',
                borderColor: settings.customTheme.accent + '30'
              }}>
                <p className="text-xs text-gray-300">
                  <strong>Note:</strong> If you provide your own API key, you'll be charged by OpenAI based on your usage. The app includes a default key that works out of the box.
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded p-3">
              <p className="text-sm text-green-300 text-center">
                ✓ Settings saved successfully!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#202225] bg-[#2f3136]">
          {activeTab === 'ai' && (
            <Button
              onClick={handleClear}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Clear AI Settings
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="text-white transition-all hover:opacity-90"
            style={{ backgroundColor: settings.customTheme.accent }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
