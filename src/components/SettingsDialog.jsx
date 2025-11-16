import { useState, useEffect } from 'react';
import { X, Key, Sparkles, Save } from 'lucide-react';
import { loadSettings, saveSettings } from '@/lib/settings';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function SettingsDialog({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    apiKey: '',
    model: 'gpt-5-nano',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loaded = loadSettings();
      setSettings(loaded);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setSettings({
      apiKey: '',
      model: 'gpt-5-nano',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#36393f] rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#202225]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
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
          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
            <p className="text-xs text-blue-300">
              <strong>Note:</strong> If you provide your own API key, you'll be charged by OpenAI based on your usage. The app includes a default key that works out of the box.
            </p>
          </div>

          {/* Success Message */}
          {saved && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
              <p className="text-sm text-green-300 text-center">
                ✓ Settings saved successfully!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#202225]">
          <Button
            onClick={handleClear}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Clear
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

