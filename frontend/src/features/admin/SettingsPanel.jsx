import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import { getSettings, updateSettings } from "./adminApi";
import AuthSettingsSection from "./AuthSettingsSection";

const defaultSettings = {
  appName: "Technosthan AgriTech",
  logoUrl: "",
  aiSettings: {
    systemPrompt: "",
    temperature: 0.7,
    maxTokens: 3000,
  },
  featureFlags: {
    aiChat: true,
    quiz: true,
    contentVisibility: true,
  },
  dashboardSettings: {
    visibleCards: ["stats", "users", "content", "quiz", "activity"],
    cardOrder: ["stats", "users", "content", "quiz", "activity"],
  },
  publicAccessEnabled: true,
  publicWebsiteEnabled: true,
  hideLoginButton: true,
  publicRoutes: [
    "/",
    "/landing",
    "/about",
    "/contact",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-phone",
    "/login/telegram",
    "/login/whatsapp",
  ],
};

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
      setSettings({
        ...defaultSettings,
        ...(response.data.data || {}),
        aiSettings: {
          ...defaultSettings.aiSettings,
          ...(response.data.data?.aiSettings || {}),
        },
        featureFlags: {
          ...defaultSettings.featureFlags,
          ...(response.data.data?.featureFlags || {}),
        },
        dashboardSettings: {
          ...defaultSettings.dashboardSettings,
          ...(response.data.data?.dashboardSettings || {}),
        },
        publicAccessEnabled:
          response.data.data?.publicAccessEnabled ??
          defaultSettings.publicAccessEnabled,
        publicRoutes:
          response.data.data?.publicRoutes ?? defaultSettings.publicRoutes,
      });
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
      toast.success(response.data?.message || "Settings saved successfully");

      window.dispatchEvent(
        new CustomEvent("publicAccessUpdated", {
          detail: {
            publicWebsiteEnabled:
              response.data.data?.publicWebsiteEnabled ??
              response.data.data?.publicAccessEnabled,
            publicAccessEnabled:
              response.data.data?.publicAccessEnabled ??
              response.data.data?.publicWebsiteEnabled,
            publicRoutes: response.data.data?.publicRoutes,
          },
        }),
      );
    } catch (err) {
      console.error("Save error:", err);
      const message = err.response?.data?.message || "Failed to save settings";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field, value) => {
    setSettings((prev) => ({
      ...defaultSettings,
      ...(prev || {}),
      [field]: value,
    }));
  };

  const currentSettings = settings || defaultSettings;

  const publicRouteOptions = [
    { label: "Home", value: "/" },
    { label: "AI Chat", value: "/chat" },
    { label: "Agritech Wiki", value: "/AgriTech Wiki" },
    { label: "Quiz", value: "/quiz/*" },
    { label: "Content", value: "/AgriTech Wiki" },
    { label: "About", value: "/about" },
    { label: "Contact", value: "/contact" },
  ];

  const isRouteSelected = (route) =>
    Array.isArray(currentSettings.publicRoutes) &&
    currentSettings.publicRoutes.includes(route);

  const togglePublicRoute = (route) => {
    const currentRoutes = currentSettings.publicRoutes || [];
    const nextRoutes = currentRoutes.includes(route)
      ? currentRoutes.filter((item) => item !== route)
      : [...currentRoutes, route];
    updateSetting("publicRoutes", nextRoutes);
  };

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-100">
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
          className="mt-4 lg:mt-0 px-6 py-3 bg-linear-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-linear-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <SettingsIcon className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Dashboard Customization */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
      >
        <h2 className={`text-2xl font-bold ${theme.text} mb-2`}>
          User Dashboard Customization
        </h2>
        <p className={`${theme.textSecondary} mb-6`}>
          Choose which sections are visible on the student/user dashboard
        </p>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold ${theme.text} mb-3`}>
              Visible Dashboard Cards
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "stats", label: "Statistics Overview" },
                { id: "content", label: "Quick Actions" },
                { id: "quiz", label: "Performance Charts" },
                { id: "activity", label: "Recent Activity" },
              ].map((card) => (
                <label
                  key={card.id}
                  className={`flex items-center p-4 rounded-xl border ${
                    currentSettings.dashboardSettings?.visibleCards?.includes(
                      card.id,
                    )
                      ? "border-blue-500 bg-blue-50/10"
                      : "border-gray-200"
                  } cursor-pointer hover:border-blue-400 transition-colors`}
                >
                  <input
                    type="checkbox"
                    checked={
                      currentSettings.dashboardSettings?.visibleCards?.includes(
                        card.id,
                      ) || false
                    }
                    onChange={(e) => {
                      const visibleCards =
                        currentSettings.dashboardSettings?.visibleCards || [];
                      if (e.target.checked) {
                        updateSetting("dashboardSettings", {
                          ...currentSettings.dashboardSettings,
                          visibleCards: [...visibleCards, card.id],
                        });
                      } else {
                        updateSetting("dashboardSettings", {
                          ...currentSettings.dashboardSettings,
                          visibleCards: visibleCards.filter(
                            (c) => c !== card.id,
                          ),
                        });
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <span className={`text-sm font-medium ${theme.text}`}>
                    {card.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

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
              value={currentSettings.appName || ""}
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
              value={currentSettings.logoUrl || ""}
              onChange={(e) => updateSetting("logoUrl", e.target.value)}
              className={`${theme.input} w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>

      {/* Website Public Mode */}
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${theme.text}`}>
              Website Public Mode
            </h2>
            <p className={`text-sm ${theme.textSecondary}`}>
              Control whether users can access the platform without login.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-gray-200 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className={`font-semibold ${theme.text}`}>
                  Enable Public Website Access
                </h3>
                {currentSettings.publicAccessEnabled && (
                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-semibold px-3 py-1">
                    Public Access Enabled
                  </span>
                )}
              </div>
              <p className={`text-sm ${theme.textSecondary}`}>
                When enabled, the website is available to guests without login.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentSettings.publicAccessEnabled}
                onChange={(e) =>
                  updateSetting("publicAccessEnabled", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {!currentSettings.publicAccessEnabled && (
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-semibold ${theme.text} mb-2`}
                >
                  Public Routes
                </label>
                <p className={`text-sm ${theme.textSecondary} mb-3`}>
                  Select which pages remain available when the website is set to
                  private mode.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {publicRouteOptions.map((routeOption) => (
                    <label
                      key={`${routeOption.label}-${routeOption.value}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isRouteSelected(routeOption.value)}
                        onChange={() => togglePublicRoute(routeOption.value)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className={`text-sm font-medium ${theme.text}`}>
                          {routeOption.label}
                        </span>
                        <p className={`text-xs ${theme.textSecondary}`}>
                          {routeOption.value}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
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
          {Object.entries(currentSettings.featureFlags || {}).map(
            ([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200"
              >
                <div>
                  <h3 className={`font-medium ${theme.text} capitalize`}>
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </h3>
                  <p className={`text-sm ${theme.textSecondary}`}>
                    Enable/disable{" "}
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()} feature
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
                          ...defaultSettings.featureFlags,
                          ...(prev?.featureFlags || {}),
                          [key]: e.target.checked,
                        },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ),
          )}
        </div>
      </div>

      <AuthSettingsSection theme={theme} />
    </div>
  );
};

export default SettingsPanel;
