import { useState, useEffect } from 'react';
import { X, Key, Sparkles, Save, Palette, Paintbrush } from 'lucide-react';
import { loadSettings, saveSettings } from '@/lib/settings';
import { Button } from './ui/button';
import { Input } from './ui/input';

const PRESET_THEMES = [
  { name: 'Red', primary: '#ef4444', primaryDark: '#dc2626' },
  { name: 'Blue', primary: '#3b82f6', primaryDark: '#2563eb' },
  { name: 'Green', primary: '#10b981', primaryDark: '#059669' },
  { name: 'Purple', primary: '#a855f7', primaryDark: '#9333ea' },
  { name: 'Orange', primary: '#f97316', primaryDark: '#ea580c' },
  { name: 'Pink', primary: '#ec4899', primaryDark: '#db2777' },
  { name: 'Teal', primary: '#14b8a6', primaryDark: '#0d9488' },
  { name: 'Indigo', primary: '#6366f1', primaryDark: '#4f46e5' },
];

export function SettingsDialog({ isOpen, onClose, onThemeChange }) {
  const [settings, setSettings] = useState({
    apiKey: '',
    model: 'gpt-5-nano',
    themeColor: '#ef4444',
    themeColorDark: '#dc2626',
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
      onThemeChange(settings.themeColor, settings.themeColorDark);
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
      themeColor: theme.primary,
      themeColorDark: theme.primaryDark,
    };
    setSettings(newSettings);
    
    // Apply theme immediately for preview
    if (onThemeChange) {
      onThemeChange(theme.primary, theme.primaryDark);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#36393f] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#202225]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: settings.themeColor }} />
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
            style={activeTab === 'theme' ? { borderBottomColor: settings.themeColor } : {}}
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
            style={activeTab === 'ai' ? { borderBottomColor: settings.themeColor } : {}}
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
              {/* Preset Themes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" style={{ color: settings.themeColor }} />
                  <label className="text-sm font-medium text-white">
                    Preset Themes
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => handlePresetTheme(theme)}
                      className={`
                        relative p-4 rounded-lg border-2 transition-all hover:scale-105
                        ${settings.themeColor === theme.primary
                          ? 'border-white shadow-lg'
                          : 'border-[#202225] hover:border-gray-600'
                        }
                      `}
                      style={{ backgroundColor: theme.primary + '20' }}
                    >
                      <div
                        className="w-full h-12 rounded mb-2"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <p className="text-xs font-medium text-white text-center">
                        {theme.name}
                      </p>
                      {settings.themeColor === theme.primary && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div className="space-y-4 pt-4 border-t border-[#202225]">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4" style={{ color: settings.themeColor }} />
                  <label className="text-sm font-medium text-white">
                    Custom Theme Colors
                  </label>
                </div>

                {/* Light Mode Color */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Light Mode Primary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={settings.themeColor}
                      onChange={(e) => {
                        const newSettings = {
                          ...settings,
                          themeColor: e.target.value,
                        };
                        setSettings(newSettings);
                        if (onThemeChange) {
                          onThemeChange(e.target.value, settings.themeColorDark);
                        }
                      }}
                      className="w-20 h-12 rounded cursor-pointer border-2 border-[#202225]"
                    />
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={settings.themeColor}
                        onChange={(e) => {
                          const newSettings = {
                            ...settings,
                            themeColor: e.target.value,
                          };
                          setSettings(newSettings);
                          if (onThemeChange) {
                            onThemeChange(e.target.value, settings.themeColorDark);
                          }
                        }}
                        className="bg-[#40444b] border-[#202225] text-white uppercase font-mono"
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>
                </div>

                {/* Dark Mode Color */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Dark Mode Primary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={settings.themeColorDark}
                      onChange={(e) => {
                        const newSettings = {
                          ...settings,
                          themeColorDark: e.target.value,
                        };
                        setSettings(newSettings);
                        if (onThemeChange) {
                          onThemeChange(settings.themeColor, e.target.value);
                        }
                      }}
                      className="w-20 h-12 rounded cursor-pointer border-2 border-[#202225]"
                    />
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={settings.themeColorDark}
                        onChange={(e) => {
                          const newSettings = {
                            ...settings,
                            themeColorDark: e.target.value,
                          };
                          setSettings(newSettings);
                          if (onThemeChange) {
                            onThemeChange(settings.themeColor, e.target.value);
                          }
                        }}
                        className="bg-[#40444b] border-[#202225] text-white uppercase font-mono"
                        placeholder="#dc2626"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-[#40444b] rounded-lg p-4 space-y-2">
                  <p className="text-xs text-gray-400 mb-3">Preview:</p>
                  <button
                    className="w-full px-4 py-2 rounded font-medium text-white transition-all"
                    style={{ backgroundColor: settings.themeColor }}
                  >
                    Light Mode Button
                  </button>
                  <button
                    className="w-full px-4 py-2 rounded font-medium text-white transition-all"
                    style={{ backgroundColor: settings.themeColorDark }}
                  >
                    Dark Mode Button
                  </button>
                </div>

                <p className="text-xs text-gray-400">
                  💡 Choose any color you like! Your theme will be applied to buttons, highlights, and accents throughout the app.
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
                  <Key className="w-4 h-4" style={{ color: settings.themeColor }} />
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
                backgroundColor: settings.themeColor + '10',
                borderColor: settings.themeColor + '30'
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
            style={{ backgroundColor: settings.themeColor }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
