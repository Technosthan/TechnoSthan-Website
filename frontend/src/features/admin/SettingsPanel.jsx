import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Type,
  Globe,
  SlidersHorizontal,
  Shield,
  KeyRound,
} from "lucide-react";

import { getSettings, updateSettings } from "./adminApi";

import AuthSettingsSection from "./AuthSettingsSection";
import EmailOtpProviderSettings from "./EmailOtpProviderSettings";
import PhoneOtpProviderSettings from "./PhoneOtpProviderSettings";
import { useSettings } from "../../contexts/SettingsContext";

const defaultSettings = {
  appName: "Technosthan AgriTech",

  logoUrl: "",
  brandWebsiteUrl: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  whatsappUrl: "",
  footerText: "",

  language: "english",

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
  const { updateSettings: updateGlobalSettings } = useSettings();

  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("general");

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
          response.data.data?.publicWebsiteEnabled ??
          defaultSettings.publicAccessEnabled,

        publicWebsiteEnabled:
          response.data.data?.publicWebsiteEnabled ??
          response.data.data?.publicAccessEnabled ??
          defaultSettings.publicWebsiteEnabled,

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

      const settingsToSave = settings || defaultSettings;
      const payload = {
        ...settingsToSave,
        publicWebsiteEnabled: settingsToSave.publicAccessEnabled,
        publicAccessEnabled: settingsToSave.publicAccessEnabled,
        publicRoutes: settingsToSave.publicRoutes || [],
      };

      if (import.meta.env.DEV) {
        console.log("Saving settings payload:", payload);
      }

      const response = await updateSettings(payload);

      setSettings(response.data.data);
      updateGlobalSettings(response.data.data);

      toast.success(response.data?.message || "Settings saved successfully");
    } catch (err) {
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
    {
      label: "Home",
      value: "/",
    },

    {
      label: "AI Chat",
      value: "/chat",
    },

    {
      label: "Agritech Wiki",
      value: "/AgriTech Wiki",
    },

    {
      label: "Quiz",
      value: "/quiz/*",
    },

    {
      label: "Content",
      value: "/AgriTech Wiki",
    },

    {
      label: "About",
      value: "/about",
    },

    {
      label: "Contact",
      value: "/contact",
    },
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

  const sections = [
    {
      id: "general",

      title: "General Settings",

      description: "Branding, app identity, and organizational defaults.",

      icon: SettingsIcon,
    },

    {
      id: "public",

      title: "Public Website Settings",

      description: "Control guest access and route visibility.",

      icon: Globe,
    },

    {
      id: "features",

      title: "Feature Toggles",

      description: "Enable or disable core modules.",

      icon: SlidersHorizontal,
    },

    {
      id: "authentication",

      title: "Authentication Settings",

      description: "Manage WhatsApp, Telegram, and OTP policies.",

      icon: Shield,
    },

    {
      id: "otp",

      title: "OTP Provider Management",

      description: "Manage Email & Phone OTP providers.",

      icon: KeyRound,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-16 w-16 mx-auto mb-4 text-cyan-500" />

          <p className={`${theme.textSecondary} font-medium`}>
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 w-full space-y-8 ${theme.text}`}>
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-5xl font-black ${theme.text} mb-3`}>
            Enterprise Settings Console
          </h1>

          <p className={`${theme.textSecondary} text-lg`}>
            Manage company-wide configuration with premium access control and
            provider orchestration.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-2xl disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}

          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <SettingsIcon className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <h3 className="text-red-300 font-semibold">Error</h3>

              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        {/* SIDEBAR */}

        <aside
          className={`${theme.card} rounded-3xl border ${theme.border} p-5 space-y-4 shadow-2xl`}
        >
          {sections.map((section) => {
            const Icon = section.icon;

            const active = section.id === activeSection;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left rounded-2xl p-4 transition-all duration-300 border ${
                  active
                    ? "border-cyan-500 bg-cyan-500/10"
                    : `${theme.border} hover:bg-white/5`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {section.title}
                    </h3>

                    <p className={`text-sm mt-1 ${theme.textSecondary}`}>
                      {section.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* CONTENT */}

        <section
          className={`${theme.card} rounded-3xl border ${theme.border} p-6 shadow-2xl`}
        >
          <div className="mb-8">
            <h2 className={`text-3xl font-black ${theme.text}`}>
              {sections.find((section) => section.id === activeSection)
                ?.title || "General Settings"}
            </h2>

            <p className={`text-sm mt-2 ${theme.textSecondary}`}>
              {
                sections.find((section) => section.id === activeSection)
                  ?.description
              }
            </p>
          </div>

          {/* GENERAL */}

          {activeSection === "general" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="Enter app name..."
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-semibold ${theme.text} mb-2 flex items-center`}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Website Language
                  </label>

                  <select
                    value={currentSettings.language || "english"}
                    onChange={(e) => updateSetting("language", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-900`}
                  >
                    <option value="english">English</option>

                    <option value="hindi">Hindi</option>

                    <option value="rajasthani">Rajasthani</option>
                  </select>

                  <p className="text-xs text-slate-400 mt-2">
                    Selected language will apply to all users across the
                    platform.
                  </p>
                </div>

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
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={currentSettings.brandWebsiteUrl || ""}
                    onChange={(e) => updateSetting("brandWebsiteUrl", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="https://technosthan.com"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={currentSettings.contactEmail || ""}
                    onChange={(e) => updateSetting("contactEmail", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="support@technosthan.com"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={currentSettings.contactPhone || ""}
                    onChange={(e) => updateSetting("contactPhone", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Contact Address
                  </label>
                  <input
                    type="text"
                    value={currentSettings.contactAddress || ""}
                    onChange={(e) => updateSetting("contactAddress", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="Jaipur, Rajasthan"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={currentSettings.facebookUrl || ""}
                    onChange={(e) => updateSetting("facebookUrl", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="https://facebook.com/technosthan"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={currentSettings.instagramUrl || ""}
                    onChange={(e) => updateSetting("instagramUrl", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="https://instagram.com/technosthan"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={currentSettings.linkedinUrl || ""}
                    onChange={(e) => updateSetting("linkedinUrl", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="https://linkedin.com/company/technosthan"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={currentSettings.youtubeUrl || ""}
                    onChange={(e) => updateSetting("youtubeUrl", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="https://youtube.com/@technosthan"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    WhatsApp URL
                  </label>
                  <input
                    type="url"
                    value={currentSettings.whatsappUrl || ""}
                    onChange={(e) => updateSetting("whatsappUrl", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500`}
                    placeholder="https://wa.me/919876543210"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Footer Text
                  </label>
                  <textarea
                    rows={3}
                    value={currentSettings.footerText || ""}
                    onChange={(e) => updateSetting("footerText", e.target.value)}
                    className={`${theme.input} w-full px-4 py-4 rounded-2xl border ${theme.border} text-white outline-none focus:ring-2 focus:ring-cyan-500 resize-none`}
                    placeholder="© 2026 Technosthan AgriTech. All rights reserved."
                  />
                </div>
              </div>
            </div>
          )}

          {/* PUBLIC */}

          {activeSection === "public" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Public Website Access
                    </h3>

                    <p className="text-slate-400 mt-2">
                      Control guest access to your platform.
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

                    <div className="w-14 h-8 bg-slate-700 rounded-full peer peer-checked:bg-cyan-500 transition-all"></div>

                    <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-all peer-checked:translate-x-6"></div>
                  </label>
                </div>

                {!currentSettings.publicAccessEnabled && (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {publicRouteOptions.map((routeOption) => (
                      <label
                        key={routeOption.value}
                        className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-cyan-500 transition cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isRouteSelected(routeOption.value)}
                          onChange={() => togglePublicRoute(routeOption.value)}
                          className="w-5 h-5 rounded"
                        />

                        <div>
                          <p className="text-white font-medium">
                            {routeOption.label}
                          </p>

                          <p className="text-slate-400 text-xs">
                            {routeOption.value}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FEATURES */}

          {activeSection === "features" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(currentSettings.featureFlags || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-white font-semibold">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h4>

                        <p className="text-slate-400 text-sm mt-1">
                          Toggle module availability
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

                        <div className="w-14 h-8 bg-slate-700 rounded-full peer peer-checked:bg-cyan-500 transition-all"></div>

                        <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-all peer-checked:translate-x-6"></div>
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* AUTH */}

          {activeSection === "authentication" && (
            <AuthSettingsSection theme={theme} />
          )}

          {/* OTP */}

          {activeSection === "otp" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <EmailOtpProviderSettings theme={theme} />

              <PhoneOtpProviderSettings theme={theme} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SettingsPanel;
