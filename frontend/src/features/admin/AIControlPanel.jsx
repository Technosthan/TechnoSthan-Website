import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Brain,
  Save,
  RefreshCw,
  Settings as SettingsIcon,
  Thermometer,
  Hash,
  MessageSquare,
} from "lucide-react";
import { getSettings, updateSettings } from "./adminApi";

const AIControlPanel = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load AI settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const response = await updateSettings(settings);
      setSettings(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save AI settings");
    } finally {
      setSaving(false);
    }
  };

  const updateAISetting = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      aiSettings: {
        ...prev.aiSettings,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="animate-spin h-16 w-16 mx-auto mb-4 text-green-500" />
          <p className={`${theme.textSecondary} font-medium`}>
            Loading AI settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 w-full space-y-8 ${theme.text}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
            AI Control Panel
          </h1>
          <p className={`${theme.textSecondary}`}>
            Configure AI behavior and responses
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <SettingsIcon className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* AI Settings */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
      >
        <div className="flex items-center mb-6">
          <Brain className="h-8 w-8 text-purple-600 mr-3" />
          <h2 className={`text-2xl font-bold ${theme.text}`}>
            AI Configuration
          </h2>
        </div>

        <div className="space-y-6">
          {/* System Prompt */}
          <div>
            <label
              className={`block text-sm font-semibold ${theme.text} mb-3 flex items-center`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              System Prompt
            </label>
            <textarea
              value={settings?.aiSettings?.systemPrompt || ""}
              onChange={(e) => updateAISetting("systemPrompt", e.target.value)}
              rows={6}
              className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none`}
              placeholder="Enter the system prompt for the AI assistant..."
            />
            <p className={`text-xs ${theme.textSecondary} mt-2`}>
              This prompt defines the AI's behavior and expertise domain.
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label
              className={`block text-sm font-semibold ${theme.text} mb-3 flex items-center`}
            >
              <Thermometer className="h-4 w-4 mr-2" />
              Temperature: {settings?.aiSettings?.temperature || 0.7}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings?.aiSettings?.temperature || 0.7}
              onChange={(e) =>
                updateAISetting("temperature", parseFloat(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative (0)</span>
              <span>Balanced (0.7)</span>
              <span>Creative (2)</span>
            </div>
            <p className={`text-xs ${theme.textSecondary} mt-2`}>
              Controls randomness in AI responses. Lower values = more
              consistent, higher values = more creative.
            </p>
          </div>

          {/* Max Tokens */}
          <div>
            <label
              className={`block text-sm font-semibold ${theme.text} mb-3 flex items-center`}
            >
              <Hash className="h-4 w-4 mr-2" />
              Max Tokens: {settings?.aiSettings?.maxTokens || 3000}
            </label>
            <input
              type="range"
              min="100"
              max="8192"
              step="100"
              value={settings?.aiSettings?.maxTokens || 3000}
              onChange={(e) =>
                updateAISetting("maxTokens", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Short (100)</span>
              <span>Medium (3000)</span>
              <span>Long (8192)</span>
            </div>
            <p className={`text-xs ${theme.textSecondary} mt-2`}>
              Maximum length of AI responses. Higher values allow longer, more
              detailed answers.
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
      >
        <h3 className={`text-xl font-bold ${theme.text} mb-4`}>
          Current Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`${theme.card} p-4 rounded-xl border ${theme.border}`}
          >
            <div className="flex items-center mb-2">
              <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
              <span className={`text-sm font-medium ${theme.textSecondary}`}>
                System Prompt
              </span>
            </div>
            <p className={`text-sm ${theme.text}`}>
              {settings?.aiSettings?.systemPrompt?.length > 50
                ? `${settings.aiSettings.systemPrompt.substring(0, 50)}...`
                : settings?.aiSettings?.systemPrompt}
            </p>
          </div>

          <div
            className={`${theme.card} p-4 rounded-xl border ${theme.border}`}
          >
            <div className="flex items-center mb-2">
              <Thermometer className="h-5 w-5 text-orange-600 mr-2" />
              <span className={`text-sm font-medium ${theme.textSecondary}`}>
                Temperature
              </span>
            </div>
            <p className={`text-lg font-bold ${theme.text}`}>
              {settings?.aiSettings?.temperature || 0.7}
            </p>
          </div>

          <div
            className={`${theme.card} p-4 rounded-xl border ${theme.border}`}
          >
            <div className="flex items-center mb-2">
              <Hash className="h-5 w-5 text-blue-600 mr-2" />
              <span className={`text-sm font-medium ${theme.textSecondary}`}>
                Max Tokens
              </span>
            </div>
            <p className={`text-lg font-bold ${theme.text}`}>
              {settings?.aiSettings?.maxTokens || 3000}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIControlPanel;
