import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Palette,
  Globe,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import { getSettings, updateSettings } from "./adminApi";

const SettingsPanel = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchSettings();
    } else {
      setError("Please log in to access settings");
    }
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load settings");
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
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="animate-spin h-16 w-16 mx-auto mb-4 text-green-500" />
          <p className={`${theme.textSecondary} font-medium`}>
            Loading settings...
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
            App Settings
          </h1>
          <p className={`${theme.textSecondary}`}>
            Configure global application settings
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* General Settings */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
      >
        <div className="flex items-center mb-6">
          <SettingsIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className={`text-2xl font-bold ${theme.text}`}>
            General Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* App Name */}
          <div>
            <label
              className={`block text-sm font-semibold ${theme.text} mb-2 flex items-center`}
            >
              <Type className="h-4 w-4 mr-2" />
              App Name
            </label>
            <input
              type="text"
              value={settings?.appName || ""}
              onChange={(e) => updateSetting("appName", e.target.value)}
              className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
              placeholder="Enter app name..."
            />
          </div>

          {/* Logo URL */}
          <div>
            <label
              className={`block text-sm font-semibold ${theme.text} mb-2 flex items-center`}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Logo URL
            </label>
            <input
              type="url"
              value={settings?.logoUrl || ""}
              onChange={(e) => updateSetting("logoUrl", e.target.value)}
              className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* Theme */}
          <div>
            <label
              className={`block text-sm font-semibold ${theme.text} mb-2 flex items-center`}
            >
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </label>
            <select
              value={settings?.theme || "default"}
              onChange={(e) => updateSetting("theme", e.target.value)}
              className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="red-black">Red & Black</option>
            </select>
          </div>

          {/* Default Language */}
          <div>
            <label
              className={`block text-sm font-semibold ${theme.text} mb-2 flex items-center`}
            >
              <Globe className="h-4 w-4 mr-2" />
              Default Language
            </label>
            <select
              value={settings?.defaultLanguage || "en"}
              onChange={(e) => updateSetting("defaultLanguage", e.target.value)}
              className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
      >
        <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>
          Feature Toggles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(settings?.featureFlags || {}).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200"
            >
              <div>
                <h3 className={`font-medium ${theme.text} capitalize`}>
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </h3>
                <p className={`text-sm ${theme.textSecondary}`}>
                  Enable/disable {key.replace(/([A-Z])/g, " $1").toLowerCase()}{" "}
                  feature
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      featureFlags: {
                        ...prev.featureFlags,
                        [key]: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Customization */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
      >
        <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>
          Dashboard Customization
        </h2>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold ${theme.text} mb-3`}>
              Visible Dashboard Cards
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["stats", "users", "content", "quiz", "activity"].map((card) => (
                <label key={card} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      settings?.dashboardSettings?.visibleCards?.includes(
                        card,
                      ) || false
                    }
                    onChange={(e) => {
                      const visibleCards =
                        settings?.dashboardSettings?.visibleCards || [];
                      if (e.target.checked) {
                        updateSetting("dashboardSettings", {
                          ...settings.dashboardSettings,
                          visibleCards: [...visibleCards, card],
                        });
                      } else {
                        updateSetting("dashboardSettings", {
                          ...settings.dashboardSettings,
                          visibleCards: visibleCards.filter((c) => c !== card),
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${theme.text} capitalize`}>
                    {card}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
