import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PlusCircle,
  Trash,
  Zap,
  Edit,
  Save,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getEmailProviders,
  createEmailProvider,
  updateEmailProvider,
  deleteEmailProvider,
  setDefaultEmailProvider,
  testEmailProvider,
} from "./adminApi";

const emailProviderTypes = [
  { value: "smtp", label: "SMTP", icon: "📧" },
  { value: "gmail_smtp", label: "Gmail SMTP", icon: "🔐" },
  { value: "sendgrid", label: "SendGrid", icon: "📨" },
  { value: "resend", label: "Resend", icon: "⚡" },
  { value: "mailgun", label: "Mailgun", icon: "🎯" },
  { value: "aws_ses", label: "AWS SES", icon: "☁️" },
  { value: "custom_smtp", label: "Custom SMTP", icon: "⚙️" },
];

const getEmailProviderDefaults = (providerType) => {
  return getEmailProviderFields(providerType).reduce((acc, field) => {
    if (field.value !== undefined) {
      acc[field.name] = field.value;
    }
    return acc;
  }, {});
};

const getEmailProviderFields = (providerType) => {
  const base = [
    {
      name: "providerName",
      label: "Provider Name",
      type: "text",
      required: true,
      placeholder: "e.g., Production SMTP",
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
    smtp: [
      { name: "host", label: "SMTP Host", type: "text", required: true },
      { name: "port", label: "SMTP Port", type: "number", required: true },
      { name: "username", label: "Username", type: "text", required: true },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "senderEmail",
        label: "Sender Email",
        type: "email",
        required: true,
      },
      {
        name: "encryption",
        label: "Encryption",
        type: "select",
        options: [
          { value: "tls", label: "TLS" },
          { value: "ssl", label: "SSL" },
          { value: "none", label: "None" },
        ],
      },
    ],
    gmail_smtp: [
      {
        name: "host",
        label: "SMTP Host",
        type: "text",
        required: true,
        value: "smtp.gmail.com",
      },
      {
        name: "port",
        label: "SMTP Port",
        type: "number",
        required: true,
        value: "587",
      },
      { name: "username", label: "Gmail Email", type: "email", required: true },
      {
        name: "password",
        label: "App Password",
        type: "password",
        required: true,
        secret: true,
        hint: "16-char app-specific password",
      },
      {
        name: "senderEmail",
        label: "Sender Email",
        type: "email",
        required: true,
      },
      {
        name: "encryption",
        label: "Encryption",
        type: "select",
        required: true,
        value: "tls",
        options: [{ value: "tls", label: "TLS" }],
      },
    ],
    sendgrid: [
      {
        name: "apiKey",
        label: "SendGrid API Key",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "senderEmail",
        label: "Sender Email",
        type: "email",
        required: true,
      },
    ],
    resend: [
      {
        name: "apiKey",
        label: "Resend API Key",
        type: "password",
        required: true,
        secret: true,
      },
      { name: "fromEmail", label: "From Email", type: "email", required: true },
    ],
    mailgun: [
      {
        name: "apiKey",
        label: "Mailgun API Key",
        type: "password",
        required: true,
        secret: true,
      },
      { name: "domain", label: "Mailgun Domain", type: "text", required: true },
      {
        name: "senderEmail",
        label: "Sender Email",
        type: "email",
        required: true,
      },
    ],
    aws_ses: [
      {
        name: "accessKey",
        label: "AWS Access Key",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "secretKey",
        label: "AWS Secret Key",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "region",
        label: "AWS Region",
        type: "text",
        required: true,
        placeholder: "us-east-1",
      },
      {
        name: "senderEmail",
        label: "Sender Email",
        type: "email",
        required: true,
      },
    ],
    custom_smtp: [
      { name: "host", label: "SMTP Host", type: "text", required: true },
      { name: "port", label: "SMTP Port", type: "number", required: true },
      { name: "username", label: "Username", type: "text", required: true },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        secret: true,
      },
      {
        name: "senderEmail",
        label: "Sender Email",
        type: "email",
        required: true,
      },
      {
        name: "encryption",
        label: "Encryption",
        type: "select",
        options: [
          { value: "tls", label: "TLS" },
          { value: "ssl", label: "SSL" },
          { value: "none", label: "None" },
        ],
      },
    ],
  };

  return [...base, ...(typeFields[providerType] || [])];
};

const EmailOtpProviderSettings = ({ theme }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState(null);
  const [providerForm, setProviderForm] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [newProviderType, setNewProviderType] = useState("sendgrid");

  useEffect(() => {
    void fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getEmailProviders();
      setProviders(res.data?.data || []);
    } catch (err) {
      console.error("[EmailOtp] fetch error", err);
      setError(
        err?.response?.data?.message || "Failed to load email providers",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (providerType = newProviderType) => {
    try {
      setCreating(true);
      const payload = {
        providerName: "New Email Provider",
        providerType: providerType || "sendgrid",
        status: "inactive",
      };
      const res = await createEmailProvider(payload);
      toast.success("Provider created");
      await fetchProviders();
      const newProviderId = res.data?.data?._id;
      if (newProviderId) {
        setEditingProviderId(newProviderId);
        setProviderForm({
          ...getEmailProviderDefaults(providerType),
          ...res.data?.data,
          ...payload,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const beginEdit = (provider) => {
    setEditingProviderId(provider._id);
    setProviderForm({
      ...getEmailProviderDefaults(provider.providerType),
      ...provider,
    });
  };

  const cancelEdit = () => {
    setEditingProviderId(null);
    setProviderForm({});
    setShowSecrets({});
  };

  const handleUpdate = async (providerId) => {
    try {
      await updateEmailProvider(providerId, providerForm);
      toast.success("Provider updated");
      setEditingProviderId(null);
      setProviderForm({});
      setShowSecrets({});
      await fetchProviders();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete provider?")) return;
    try {
      await deleteEmailProvider(id);
      toast.success("Deleted");
      await fetchProviders();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultEmailProvider(id);
      toast.success("Set as default");
      await fetchProviders();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to set default");
    }
  };

  const handleTest = async (id) => {
    try {
      await testEmailProvider(id);
      toast.success("Connection OK");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Test failed");
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border ${theme.border} p-6 ${theme.card}`}>
        <div className="py-8 text-center text-sm text-gray-500">
          Loading email provider configuration...
        </div>
      </div>
    );
  }

  const fields = providerForm.providerType
    ? getEmailProviderFields(providerForm.providerType)
    : [];

  return (
    <div className={`rounded-2xl border ${theme.border} p-6 ${theme.card}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h4 className={`text-lg font-semibold ${theme.text}`}>
            Email OTP Providers
          </h4>
          <p className={`text-sm ${theme.textSecondary}`}>
            Configure email gateway providers for OTP delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={newProviderType}
            onChange={(e) => setNewProviderType(e.target.value)}
            className={`${theme.input} rounded-xl border ${theme.border} px-3 py-2`}
          >
            {emailProviderTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleCreate(newProviderType)}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {providers.length === 0 && (
        <div
          className={`mb-4 rounded-2xl border border-dashed ${theme.border} p-4 text-sm ${theme.textSecondary} bg-white/50 dark:bg-gray-900/30`}
        >
          No email provider has been configured yet. SendGrid will be used as
          the default until you add and activate another provider.
        </div>
      )}

      <div className="space-y-4">
        {providers.map((provider) => {
          const editing = editingProviderId === provider._id;
          const providerTypeLabel =
            emailProviderTypes.find((t) => t.value === provider.providerType)
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
                      "Manage provider connection and OTP delivery settings."}
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
                      value={providerForm.providerType || "sendgrid"}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setProviderForm((prev) => ({
                          ...prev,
                          providerType: newType,
                          ...getEmailProviderDefaults(newType),
                        }));
                      }}
                      className={`${theme.input} w-full rounded-xl border ${theme.border} px-4 py-3`}
                    >
                      {emailProviderTypes.map((t) => (
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
                        providerForm[field.name] ?? field.value ?? "";

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
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition-all duration-200"
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
        })}
      </div>
    </div>
  );
};

export default EmailOtpProviderSettings;
