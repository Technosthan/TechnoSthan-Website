import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Save,
  PlusCircle,
  Trash,
  Zap,
  Edit,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getPhoneProviders,
  createPhoneProvider,
  updatePhoneProvider,
  deletePhoneProvider,
  setDefaultPhoneProvider,
  testPhoneProvider,
} from "./adminApi";

const phoneProviderTypes = [
  { value: "twilio", label: "Twilio", icon: "📞" },
  { value: "msg91", label: "MSG91", icon: "💬" },
  { value: "firebase", label: "Firebase OTP", icon: "🔥" },
  { value: "whatsapp", label: "WhatsApp", icon: "💚" },
  { value: "vonage", label: "Vonage", icon: "🌐" },
  { value: "custom_api", label: "Custom API", icon: "⚙️" },
];

const getPhoneProviderFields = (providerType) => {
  const base = [
    {
      name: "providerName",
      label: "Provider Name",
      type: "text",
      required: true,
      placeholder: "e.g., Production Twilio",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  const typeFields = {
    twilio: [
      {
        name: "twilioAccountSid",
        label: "Account SID",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "twilioAuthToken",
        label: "Auth Token",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "twilioPhoneNumber",
        label: "Phone Number",
        type: "tel",
        required: true,
        placeholder: "+1234567890",
      },
    ],
    msg91: [
      {
        name: "msg91AuthKey",
        label: "Auth Key",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "msg91TemplateId",
        label: "Template ID",
        type: "text",
        required: true,
      },
    ],
    firebase: [
      {
        name: "firebaseApiKey",
        label: "Firebase API Key",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "firebaseRecaptchaToken",
        label: "reCAPTCHA Token",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "firebaseConfig",
        label: "Firebase Config (JSON)",
        type: "textarea",
        required: true,
        placeholder: '{"projectId":"..."}',
      },
    ],
    whatsapp: [
      {
        name: "whatsappAccessToken",
        label: "Access Token",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "whatsappPhoneNumberId",
        label: "Phone Number ID",
        type: "text",
        required: true,
      },
      {
        name: "whatsappVerifyToken",
        label: "Verify Token",
        type: "password",
        required: true,
        secret: true,
      },
    ],
    vonage: [
      {
        name: "vonageApiKey",
        label: "API Key",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "vonageApiSecret",
        label: "API Secret",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "vonageFromNumber",
        label: "From Number",
        type: "tel",
        required: true,
        placeholder: "+1234567890",
      },
    ],
    custom_api: [
      {
        name: "customApiEndpoint",
        label: "API Endpoint",
        type: "url",
        required: true,
      },
      {
        name: "customApiMethod",
        label: "HTTP Method",
        type: "select",
        options: [
          { value: "POST", label: "POST" },
          { value: "GET", label: "GET" },
          { value: "PUT", label: "PUT" },
          { value: "PATCH", label: "PATCH" },
        ],
      },
      {
        name: "customApiPayloadTemplate",
        label: "Payload Template (JSON)",
        type: "textarea",
        required: true,
        placeholder: '{"phone":"{{phone}}","otp":"{{otp}}"}',
      },
      {
        name: "customApiHeaders",
        label: "Custom Headers (JSON)",
        type: "textarea",
        required: false,
        placeholder: '{"Authorization":"Bearer <token>","X-Api-Key":"..."}',
      },
      {
        name: "customApiAuthKey",
        label: "Auth Key (optional)",
        type: "password",
        secret: true,
      },
      {
        name: "customApiAuthHeaderName",
        label: "Auth Header Name",
        type: "text",
        placeholder: "Authorization",
      },
    ],
  };

  return [...base, ...(typeFields[providerType] || [])];
};

const PhoneOtpProviderSettings = ({ theme }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState(null);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [providerForm, setProviderForm] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [jsonFieldErrors, setJsonFieldErrors] = useState({});
  const [newProviderType, setNewProviderType] = useState("twilio");

  const formatFieldValue = (field, value) => {
    if (
      (field.name === "firebaseConfig" || field.name === "customApiHeaders") &&
      typeof value === "object" &&
      value !== null
    ) {
      return JSON.stringify(value, null, 2);
    }
    return value ?? "";
  };

  const validateJsonField = (fieldName, rawValue) => {
    if (!rawValue || typeof rawValue !== "string") {
      setJsonFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
      return true;
    }

    try {
      JSON.parse(rawValue);
      setJsonFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
      return true;
    } catch {
      const label =
        fieldName === "firebaseConfig" ? "Firebase config" : "Custom headers";
      const message = `${label} must be valid JSON.`;
      setJsonFieldErrors((prev) => ({ ...prev, [fieldName]: message }));
      return false;
    }
  };

  const buildPhoneProviderPayload = (form) => {
    const payload = { ...form };

    if (payload.providerType === "firebase") {
      if (typeof payload.firebaseConfig === "string") {
        try {
          payload.firebaseConfig = JSON.parse(payload.firebaseConfig);
        } catch {
          throw new Error("Firebase config must be valid JSON.");
        }
      }
    }

    if (payload.providerType === "custom_api") {
      if (typeof payload.customApiHeaders === "string") {
        try {
          payload.customApiHeaders = payload.customApiHeaders.trim()
            ? JSON.parse(payload.customApiHeaders)
            : {};
        } catch {
          throw new Error("Custom headers must be valid JSON.");
        }
      }
    }

    return payload;
  };

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPhoneProviders();
      const list = res.data?.data || [];
      setProviders(list);
      if (!selectedProviderId && list.length) {
        setSelectedProviderId(list[0]._id);
      }
    } catch (err) {
      console.error("[PhoneOtp] fetch error", err);
      setError(
        err?.response?.data?.message || "Failed to load phone providers",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedProviderId]);

  useEffect(() => {
    void fetchProviders();
  }, [fetchProviders]);

  const handleCreate = async (providerType = newProviderType) => {
    try {
      setCreating(true);
      const payload = {
        providerName: "New Phone Provider",
        providerType: providerType || "twilio",
        status: "inactive",
      };
      const res = await createPhoneProvider(payload);
      toast.success("Phone provider created");
      await fetchProviders();
      const newId = res.data?.data?._id;
      if (newId) {
        setSelectedProviderId(newId);
        setEditingProviderId(newId);
        setProviderForm(res.data?.data || payload);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const beginEdit = (provider) => {
    setSelectedProviderId(provider._id);
    setEditingProviderId(provider._id);
    setProviderForm({ ...provider });
  };

  const cancelEdit = () => {
    setEditingProviderId(null);
    setProviderForm({});
    setShowSecrets({});
  };

  const handleUpdate = async (providerId) => {
    if (Object.values(jsonFieldErrors).some(Boolean)) {
      toast.error("Fix invalid JSON fields before saving.");
      return;
    }

    try {
      const payload = buildPhoneProviderPayload(providerForm);
      await updatePhoneProvider(providerId, payload);
      toast.success("Phone provider updated");
      setEditingProviderId(null);
      setProviderForm({});
      setShowSecrets({});
      await fetchProviders();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.message || err?.response?.data?.message || "Update failed",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete provider?")) return;
    try {
      await deletePhoneProvider(id);
      toast.success("Deleted");
      await fetchProviders();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultPhoneProvider(id);
      toast.success("Set as default");
      await fetchProviders();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to set default");
    }
  };

  const handleTest = async (id) => {
    try {
      await testPhoneProvider(id);
      toast.success("Connection OK");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Test failed");
    }
  };

  const fields = providerForm.providerType
    ? getPhoneProviderFields(providerForm.providerType)
    : [];

  if (loading) {
    return (
      <div className={`rounded-2xl border ${theme.border} p-6 ${theme.card}`}>
        <div className="py-6 text-center text-sm text-gray-500">
          Loading phone providers...
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${theme.border} p-6 ${theme.card}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h4 className={`text-lg font-semibold ${theme.text}`}>
            Phone OTP Providers
          </h4>
          <p className={`text-sm ${theme.textSecondary}`}>
            Configure SMS, WhatsApp, and phone-based OTP providers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={newProviderType}
            onChange={(e) => setNewProviderType(e.target.value)}
            className={`${theme.input} rounded-xl border ${theme.border} px-3 py-2`}
          >
            {phoneProviderTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleCreate(newProviderType)}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle size={16} />
            )}
            Add provider
          </button>
        </div>
      </div>

      {error && (
        <div
          className={`mb-4 rounded-xl border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30`}
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        {providers.length === 0 ? (
          <div
            className={`rounded-xl border ${theme.border} p-6 text-center text-sm ${theme.textSecondary}`}
          >
            No phone providers configured yet.
          </div>
        ) : (
          providers.map((provider) => {
            const editing = editingProviderId === provider._id;
            const providerTypeLabel =
              phoneProviderTypes.find((t) => t.value === provider.providerType)
                ?.label || provider.providerType;

            return (
              <div
                key={provider._id}
                className={`rounded-3xl border ${theme.border} p-5 ${editing ? `${theme.card}` : `dark:bg-gray-800/50 bg-white/50`} transition-all duration-200`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-base font-semibold ${theme.text}`}>
                        {provider.providerName ||
                          provider.name ||
                          "Untitled Provider"}
                      </span>
                      {provider.isDefault && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Default
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          provider.status === "active"
                            ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {provider.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300`}
                      >
                        {providerTypeLabel}
                      </span>
                    </div>
                    <div className={`text-sm ${theme.textSecondary}`}>
                      {provider.description ||
                        "Manage provider configuration and OTP delivery settings."}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTest(provider._id)}
                      className={`inline-flex items-center gap-2 rounded-xl border ${theme.border} px-3 py-2 text-sm ${theme.textSecondary} hover:${theme.borderHover} transition-colors`}
                    >
                      <Zap size={14} /> Test
                    </button>
                    <button
                      onClick={() => handleSetDefault(provider._id)}
                      className={`inline-flex items-center gap-2 rounded-xl border ${theme.border} px-3 py-2 text-sm ${theme.textSecondary} hover:${theme.borderHover} transition-colors`}
                    >
                      <CheckCircle2 size={14} /> Set Default
                    </button>
                    <button
                      onClick={() => beginEdit(provider)}
                      className={`inline-flex items-center gap-2 rounded-xl border ${theme.border} px-3 py-2 text-sm ${theme.textSecondary} hover:${theme.borderHover} transition-colors`}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(provider._id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </div>
                </div>

                {editing && (
                  <div
                    className={`mt-5 rounded-3xl border ${theme.border} p-5 dark:bg-gray-900/50 bg-slate-50`}
                  >
                    {/* Provider type selector - allows admin to change provider type */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-semibold ${theme.text} mb-2`}
                      >
                        Provider Type
                      </label>
                      <select
                        value={providerForm.providerType || "twilio"}
                        onChange={(e) =>
                          setProviderForm((prev) => ({
                            ...prev,
                            providerType: e.target.value,
                          }))
                        }
                        className={`${theme.input} w-full rounded-xl border ${theme.border} px-4 py-3`}
                      >
                        {phoneProviderTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {fields.map((field) => {
                        const key = `${editingProviderId}-${field.name}`;
                        const isSecret = field.secret;
                        const showSecret = showSecrets[key];
                        const value =
                          providerForm[field.name] || field.value || "";

                        if (field.type === "select") {
                          return (
                            <div key={field.name}>
                              <label
                                className={`block text-sm font-semibold ${theme.text} mb-2`}
                              >
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500">*</span>
                                )}
                              </label>
                              <select
                                value={value}
                                onChange={(e) =>
                                  setProviderForm((prev) => ({
                                    ...prev,
                                    [field.name]: e.target.value,
                                  }))
                                }
                                className={`${theme.input} w-full rounded-xl border ${theme.border} px-4 py-3`}
                              >
                                <option value="">{`Select ${field.label}`}</option>
                                {field.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        if (field.type === "textarea") {
                          return (
                            <div
                              key={field.name}
                              className="md:col-span-2 lg:col-span-3"
                            >
                              <label
                                className={`block text-sm font-semibold ${theme.text} mb-2`}
                              >
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500">*</span>
                                )}
                              </label>
                              <textarea
                                value={formatFieldValue(field, value)}
                                onChange={(e) => {
                                  const rawValue = e.target.value;
                                  setProviderForm((prev) => ({
                                    ...prev,
                                    [field.name]: rawValue,
                                  }));
                                  if (
                                    field.name === "firebaseConfig" ||
                                    field.name === "customApiHeaders"
                                  ) {
                                    validateJsonField(field.name, rawValue);
                                  }
                                }}
                                placeholder={field.placeholder}
                                rows={4}
                                className={`${theme.input} w-full rounded-xl border ${theme.border} px-4 py-3 font-mono text-sm`}
                              />
                              {field.hint && (
                                <p
                                  className={`text-xs ${theme.textSecondary} mt-1`}
                                >
                                  {field.hint}
                                </p>
                              )}
                              {jsonFieldErrors[field.name] && (
                                <p className="text-xs text-red-500 mt-1">
                                  {jsonFieldErrors[field.name]}
                                </p>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div key={field.name}>
                            <label
                              className={`block text-sm font-semibold ${theme.text} mb-2`}
                            >
                              {field.label}
                              {field.required && (
                                <span className="text-red-500">*</span>
                              )}
                            </label>
                            <div className="relative">
                              <input
                                type={
                                  isSecret && !showSecret
                                    ? "password"
                                    : field.type
                                }
                                value={value}
                                onChange={(e) =>
                                  setProviderForm((prev) => ({
                                    ...prev,
                                    [field.name]: e.target.value,
                                  }))
                                }
                                placeholder={field.placeholder}
                                className={`${theme.input} w-full rounded-xl border ${theme.border} px-4 py-3 ${isSecret ? "pr-10" : ""}`}
                              />
                              {isSecret && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowSecrets((prev) => ({
                                      ...prev,
                                      [key]: !showSecret,
                                    }))
                                  }
                                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textSecondary} hover:${theme.text}`}
                                >
                                  {showSecret ? (
                                    <EyeOff size={16} />
                                  ) : (
                                    <Eye size={16} />
                                  )}
                                </button>
                              )}
                            </div>
                            {field.hint && (
                              <p
                                className={`text-xs ${theme.textSecondary} mt-1`}
                              >
                                {field.hint}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleUpdate(provider._id)}
                        disabled={Object.values(jsonFieldErrors).some(Boolean)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={16} /> Save changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className={`inline-flex items-center gap-2 rounded-xl border ${theme.border} px-4 py-3 text-sm ${theme.textSecondary} hover:${theme.borderHover}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PhoneOtpProviderSettings;
