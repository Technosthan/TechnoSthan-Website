import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  MessageCircleMore,
  Save,
  Send,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAuthSettings,
  testTelegramConnection,
  testWhatsappConnection,
  updateAuthSettings,
} from "./adminApi";

const defaultAuthSettings = {
  whatsapp: {
    enabled: true,
    accessToken: "",
    phoneNumberId: "",
    verifyToken: "",
    templateName: "otp_verification",
    businessAccountId: "",
  },
  telegram: {
    enabled: true,
    botToken: "",
    botUsername: "",
    webhookUrl: "",
  },
  emailOtp: {
    enabled: true,
  },
  phoneOtp: {
    enabled: true,
  },
  otpSecurity: {
    expiryMinutes: 5,
    resendCooldown: 60,
    maxAttempts: 5,
    maxDailyRequests: 10,
  },
};

const fieldClassName =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200";

const mergeSettings = (data = {}) => ({
  ...defaultAuthSettings,
  ...data,
  whatsapp: {
    ...defaultAuthSettings.whatsapp,
    ...(data.whatsapp || {}),
  },
  telegram: {
    ...defaultAuthSettings.telegram,
    ...(data.telegram || {}),
  },
  emailOtp: {
    ...defaultAuthSettings.emailOtp,
    ...(data.emailOtp || {}),
  },
  phoneOtp: {
    ...defaultAuthSettings.phoneOtp,
    ...(data.phoneOtp || {}),
  },
  otpSecurity: {
    ...defaultAuthSettings.otpSecurity,
    ...(data.otpSecurity || {}),
  },
});

const AuthSettingsSection = ({ theme }) => {
  const [settings, setSettings] = useState(defaultAuthSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSection, setSavingSection] = useState("");
  const [testingSection, setTestingSection] = useState("");
  const [visibleFields, setVisibleFields] = useState({
    whatsappAccessToken: false,
    whatsappVerifyToken: false,
    telegramBotToken: false,
  });

  useEffect(() => {
    void fetchAuthSettings();
  }, []);

  const fetchAuthSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAuthSettings();
      setSettings(mergeSettings(response.data?.data));
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load authentication settings";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validateSection = (section) => {
    if (section === "whatsapp") {
      const whatsapp = settings.whatsapp;
      if (whatsapp.enabled) {
        if (!whatsapp.accessToken.trim())
          return "WhatsApp access token is required";
        if (!whatsapp.phoneNumberId.trim())
          return "Phone number ID is required";
        if (!whatsapp.verifyToken.trim()) return "Verify token is required";
        if (!whatsapp.templateName.trim()) return "Template name is required";
      }
    }

    if (section === "telegram") {
      const telegram = settings.telegram;
      if (telegram.enabled) {
        if (!telegram.botToken.trim()) return "Telegram bot token is required";
        if (!telegram.botUsername.trim())
          return "Telegram bot username is required";
      }
      if (settings.telegram.webhookUrl.trim()) {
        try {
          new URL(settings.telegram.webhookUrl);
        } catch {
          return "Webhook URL must be a valid URL";
        }
      }
    }

    if (section === "otpVerification") {
      if (!settings.emailOtp.enabled && !settings.phoneOtp.enabled) {
        return "At least one OTP verification method must be enabled: email or phone.";
      }
    }

    if (section === "otpSecurity") {
      const rules = [
        [
          "expiryMinutes",
          1,
          60,
          "OTP expiry time must be between 1 and 60 minutes",
        ],
        [
          "resendCooldown",
          30,
          300,
          "Resend cooldown must be between 30 and 300 seconds",
        ],
        ["maxAttempts", 1, 10, "Max OTP attempts must be between 1 and 10"],
        [
          "maxDailyRequests",
          1,
          50,
          "Max daily OTP requests must be between 1 and 50",
        ],
      ];

      for (const [key, min, max, message] of rules) {
        const value = Number(settings.otpSecurity[key]);
        if (!Number.isInteger(value) || value < min || value > max) {
          return message;
        }
      }
    }

    return "";
  };

  const handleSave = async (section) => {
    const validationError = validateSection(section);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setSavingSection(section);
      setError("");
      const payload =
        section === "otpVerification"
          ? {
              emailOtp: settings.emailOtp,
              phoneOtp: settings.phoneOtp,
            }
          : { [section]: settings[section] };
      const response = await updateAuthSettings(payload);
      const merged = mergeSettings(response.data?.data);
      setSettings(merged);
      toast.success(response.data?.message || "Settings saved successfully");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to save authentication settings";
      setError(message);
      toast.error(message);
    } finally {
      setSavingSection("");
    }
  };

  const handleTest = async (section) => {
    try {
      setTestingSection(section);
      setError("");
      const response =
        section === "whatsapp"
          ? await testWhatsappConnection()
          : await testTelegramConnection();
      toast.success(response.data?.message || "Connection successful");
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Connection test failed";
      setError(message);
      toast.error(message);
    } finally {
      setTestingSection("");
    }
  };

  const renderTokenField = ({
    id,
    label,
    value,
    onChange,
    visible,
    onToggle,
    placeholder,
  }) => (
    <div>
      <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${theme.input} ${fieldClassName} pr-12`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
      >
        <div className="flex items-center justify-center py-8">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${theme.card} rounded-2xl shadow-lg p-8 border ${theme.border}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-8 w-8 text-blue-600" />
        <h2 className={`text-2xl font-bold ${theme.text}`}>
          Authentication Settings
        </h2>
      </div>
      <p className={`${theme.textSecondary} mb-6`}>
        Manage WhatsApp, Telegram, and OTP security configuration without
        changing deployment variables.
      </p>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircleMore className="h-5 w-5 text-green-600" />
            <h3 className={`text-xl font-semibold ${theme.text}`}>
              WhatsApp Login Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.whatsapp.enabled}
                onChange={(e) =>
                  updateSection("whatsapp", "enabled", e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className={`text-sm font-medium ${theme.text}`}>
                Enable WhatsApp Login
              </span>
            </label>

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Phone Number ID
              </label>
              <input
                type="text"
                value={settings.whatsapp.phoneNumberId}
                onChange={(e) =>
                  updateSection("whatsapp", "phoneNumberId", e.target.value)
                }
                className={`${theme.input} ${fieldClassName}`}
              />
            </div>

            {renderTokenField({
              id: "whatsappAccessToken",
              label: "WhatsApp Access Token",
              value: settings.whatsapp.accessToken,
              onChange: (e) =>
                updateSection("whatsapp", "accessToken", e.target.value),
              visible: visibleFields.whatsappAccessToken,
              onToggle: () =>
                setVisibleFields((prev) => ({
                  ...prev,
                  whatsappAccessToken: !prev.whatsappAccessToken,
                })),
              placeholder: "Enter WhatsApp access token",
            })}

            {renderTokenField({
              id: "whatsappVerifyToken",
              label: "Verify Token",
              value: settings.whatsapp.verifyToken,
              onChange: (e) =>
                updateSection("whatsapp", "verifyToken", e.target.value),
              visible: visibleFields.whatsappVerifyToken,
              onToggle: () =>
                setVisibleFields((prev) => ({
                  ...prev,
                  whatsappVerifyToken: !prev.whatsappVerifyToken,
                })),
              placeholder: "Enter webhook verify token",
            })}

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Template Name
              </label>
              <input
                type="text"
                value={settings.whatsapp.templateName}
                onChange={(e) =>
                  updateSection("whatsapp", "templateName", e.target.value)
                }
                className={`${theme.input} ${fieldClassName}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Business Account ID
              </label>
              <input
                type="text"
                value={settings.whatsapp.businessAccountId}
                onChange={(e) =>
                  updateSection("whatsapp", "businessAccountId", e.target.value)
                }
                className={`${theme.input} ${fieldClassName}`}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleSave("whatsapp")}
              disabled={savingSection === "whatsapp"}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "whatsapp" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save WhatsApp Settings
            </button>
            <button
              type="button"
              onClick={() => handleTest("whatsapp")}
              disabled={testingSection === "whatsapp"}
              className="px-5 py-3 rounded-xl border border-gray-300 hover:border-blue-400 flex items-center gap-2"
            >
              {testingSection === "whatsapp" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Test Connection
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound className="h-5 w-5 text-sky-600" />
            <h3 className={`text-xl font-semibold ${theme.text}`}>
              Telegram Login Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.telegram.enabled}
                onChange={(e) =>
                  updateSection("telegram", "enabled", e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className={`text-sm font-medium ${theme.text}`}>
                Enable Telegram Login
              </span>
            </label>

            {renderTokenField({
              id: "telegramBotToken",
              label: "Telegram Bot Token",
              value: settings.telegram.botToken,
              onChange: (e) =>
                updateSection("telegram", "botToken", e.target.value),
              visible: visibleFields.telegramBotToken,
              onToggle: () =>
                setVisibleFields((prev) => ({
                  ...prev,
                  telegramBotToken: !prev.telegramBotToken,
                })),
              placeholder: "Enter Telegram bot token",
            })}

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Telegram Bot Username
              </label>
              <input
                type="text"
                value={settings.telegram.botUsername}
                onChange={(e) =>
                  updateSection("telegram", "botUsername", e.target.value)
                }
                className={`${theme.input} ${fieldClassName}`}
                placeholder="@your_bot"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Telegram Webhook URL
              </label>
              <input
                type="url"
                value={settings.telegram.webhookUrl}
                onChange={(e) =>
                  updateSection("telegram", "webhookUrl", e.target.value)
                }
                className={`${theme.input} ${fieldClassName}`}
                placeholder="https://example.com/webhook/telegram"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleSave("telegram")}
              disabled={savingSection === "telegram"}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "telegram" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Telegram Settings
            </button>
            <button
              type="button"
              onClick={() => handleTest("telegram")}
              disabled={testingSection === "telegram"}
              className="px-5 py-3 rounded-xl border border-gray-300 hover:border-blue-400 flex items-center gap-2"
            >
              {testingSection === "telegram" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Test Bot Connection
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <KeyRound className="h-5 w-5 text-sky-600" />
            <h3 className={`text-xl font-semibold ${theme.text}`}>
              OTP Verification Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.emailOtp.enabled}
                onChange={(e) =>
                  updateSection("emailOtp", "enabled", e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className={`text-sm font-medium ${theme.text}`}>
                Require Email OTP Verification
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={settings.phoneOtp.enabled}
                onChange={(e) =>
                  updateSection("phoneOtp", "enabled", e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className={`text-sm font-medium ${theme.text}`}>
                Require Phone OTP Verification
              </span>
            </label>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleSave("otpVerification")}
              disabled={savingSection === "otpVerification"}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "otpVerification" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save OTP Verification Settings
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            <h3 className={`text-xl font-semibold ${theme.text}`}>
              OTP Security Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                OTP Expiry Time
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.otpSecurity.expiryMinutes}
                onChange={(e) =>
                  updateSection(
                    "otpSecurity",
                    "expiryMinutes",
                    Number(e.target.value),
                  )
                }
                className={`${theme.input} ${fieldClassName}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Resend Cooldown
              </label>
              <input
                type="number"
                min="30"
                max="300"
                value={settings.otpSecurity.resendCooldown}
                onChange={(e) =>
                  updateSection(
                    "otpSecurity",
                    "resendCooldown",
                    Number(e.target.value),
                  )
                }
                className={`${theme.input} ${fieldClassName}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Max OTP Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.otpSecurity.maxAttempts}
                onChange={(e) =>
                  updateSection(
                    "otpSecurity",
                    "maxAttempts",
                    Number(e.target.value),
                  )
                }
                className={`${theme.input} ${fieldClassName}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-semibold ${theme.text} mb-2`}
              >
                Max Daily OTP Requests
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.otpSecurity.maxDailyRequests}
                onChange={(e) =>
                  updateSection(
                    "otpSecurity",
                    "maxDailyRequests",
                    Number(e.target.value),
                  )
                }
                className={`${theme.input} ${fieldClassName}`}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleSave("otpSecurity")}
              disabled={savingSection === "otpSecurity"}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {savingSection === "otpSecurity" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save OTP Security Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSettingsSection;
