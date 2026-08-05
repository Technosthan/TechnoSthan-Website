import { useEffect, useMemo, useState } from "react";
import { Mail, RefreshCw, Save, Shield, Send } from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../lib/api";
import { AUTH_STORAGE_KEYS } from "../../utils/auth";
import { useToast } from "../Toast/ToastProvider";
import { useSettings } from "../../contexts/SettingsContext";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";

const MASKED_SECRET = "••••••••••••••••";

const DEFAULT_FORM = {
  provider: "sendgrid",
  senderName: "",
  senderEmail: "",
  replyToEmail: "",
  adminNotificationEmail: "",
  confirmationEmailEnabled: false,
  sendgridApiKeyMasked: MASKED_SECRET,
  sendgridConfigured: false,
  sendgridStatus: "Unavailable",
  testRecipient: "",
};

const AdminEmailSettings = () => {
  const { showToast } = useToast();
  const { refreshSettings } = useSettings();
  const { refreshAccess } = useWorkspaceAccess();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/api/admin/settings/email");
      const settings = data?.data || {};

      setForm({
        provider: settings.provider || "sendgrid",
        senderName: settings.senderName || "",
        senderEmail: settings.senderEmail || "",
        replyToEmail: settings.replyToEmail || "",
        adminNotificationEmail: settings.adminNotificationEmail || "",
        confirmationEmailEnabled: Boolean(settings.confirmationEmailEnabled),
        sendgridApiKeyMasked: settings.sendgridConfigured
          ? MASKED_SECRET
          : "Not configured",
        sendgridConfigured: Boolean(settings.sendgridConfigured),
        sendgridStatus: settings.sendgridStatus || "Unavailable",
        testRecipient:
          settings.adminNotificationEmail ||
          settings.replyToEmail ||
          settings.senderEmail ||
          "",
      });
    } catch (loadError) {
      console.error("Failed to load email settings:", loadError);
      setError(
        loadError.response?.data?.message ||
          "Unable to load email settings right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError("");

      const emailSettings = {
        provider: form.provider,
        senderName: form.senderName.trim(),
        senderEmail: form.senderEmail.trim(),
        replyToEmail: form.replyToEmail.trim(),
        adminNotificationEmail: form.adminNotificationEmail.trim(),
        confirmationEmailEnabled: Boolean(form.confirmationEmailEnabled),
      };

      await api.patch("/api/admin/workspace-services", {
        emailSettings,
      });

      localStorage.setItem(
        AUTH_STORAGE_KEYS.workspaceSettingsUpdatedAt,
        String(Date.now()),
      );
      refreshSettings();
      refreshAccess();
      await loadSettings();

      showToast({
        title: "Email settings saved",
        message: "Email preferences updated successfully.",
        type: "success",
      });
    } catch (saveError) {
      console.error("Failed to save email settings:", saveError);
      const message =
        saveError.response?.data?.message ||
        "Unable to save email settings right now.";
      setError(message);
      showToast({
        title: "Save failed",
        message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    const recipient = String(form.testRecipient || "").trim();
    if (!recipient) {
      showToast({
        title: "Recipient required",
        message: "Add a valid test recipient email address first.",
        type: "error",
      });
      return;
    }

    try {
      setTesting(true);
      await api.post("/api/admin/test-email", {
        email: recipient,
      });

      showToast({
        title: "Test email sent",
        message: `A test email was sent to ${recipient}.`,
        type: "success",
      });
    } catch (testError) {
      console.error("Failed to send test email:", testError);
      showToast({
        title: "Test email failed",
        message:
          testError.response?.data?.message ||
          "Unable to send the test email right now.",
        type: "error",
      });
    } finally {
      setTesting(false);
    }
  };

  const statusTone = useMemo(
    () => (form.sendgridConfigured ? "text-emerald-200" : "text-amber-200"),
    [form.sendgridConfigured],
  );

  return (
    <AdminLayout
      title="Email Settings"
      subtitle="Server email preferences and delivery status."
    >
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/55 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.9)] backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-200">
              <Mail size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
                Email delivery
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Email Settings
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Manage the email preferences used by the admin workspace and
                check delivery readiness before sending mail.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Active provider
            </p>

            <p className="mt-3 truncate text-lg font-semibold text-white">
              {form.provider || "sendgrid"}
            </p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              SendGrid status
            </p>

            <p className={`mt-3 truncate text-lg font-semibold ${statusTone}`}>
              {form.sendgridStatus}
            </p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Sender
            </p>

            <p
              title={form.senderName || "TechnoSthan"}
              className="mt-3 truncate text-sm font-semibold text-white"
            >
              {form.senderName || "TechnoSthan"}
            </p>

            <p
              title={form.senderEmail || "Not configured"}
              className="mt-1 truncate text-xs text-slate-400"
            >
              {form.senderEmail || "Not configured"}
            </p>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Secret key
            </p>

            <p
              title={
                form.sendgridConfigured
                  ? "SendGrid API key is configured"
                  : "SendGrid API key is not configured"
              }
              className="mt-3 block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-slate-300"
            >
              {form.sendgridConfigured ? MASKED_SECRET : "Not configured"}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.9)] backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Mail profile</h2>
              <p className="mt-1 text-sm text-slate-400">
                Save admin-facing email preferences and test delivery.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
              <button
                type="button"
                onClick={loadSettings}
                className="inline-flex items-center gap-2 justify-center rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500/20 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 space-y-4">
              <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
              <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Sender name
                </span>
                <input
                  value={form.senderName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      senderName: event.target.value,
                    }))
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                />
              </label>

              <label className="block rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Sender email
                </span>
                <input
                  type="email"
                  value={form.senderEmail}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      senderEmail: event.target.value,
                    }))
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                />
              </label>

              <label className="block rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Reply-to email
                </span>
                <input
                  type="email"
                  value={form.replyToEmail}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      replyToEmail: event.target.value,
                    }))
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                />
              </label>

              <label className="block rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Admin notification email
                </span>
                <input
                  type="email"
                  value={form.adminNotificationEmail}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      adminNotificationEmail: event.target.value,
                    }))
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                />
              </label>

              <label className="block rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Confirmation emails
                    </span>
                    <p className="mt-2 text-sm text-slate-400">
                      Use the existing form confirmation flow for form-specific
                      notifications.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.confirmationEmailEnabled}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          confirmationEmailEnabled: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-white/15 bg-slate-950 text-indigo-500"
                    />
                    Enabled
                  </label>
                </div>
              </label>

              <label className="block rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Test recipient
                </span>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={form.testRecipient}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        testRecipient: event.target.value,
                      }))
                    }
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                  />
                  <button
                    type="button"
                    onClick={sendTestEmail}
                    disabled={testing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-60 sm:shrink-0"
                  >
                    <Send size={16} />
                    {testing ? "Sending..." : "Test email"}
                  </button>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEmailSettings;
