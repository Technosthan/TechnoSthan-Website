import { useEffect, useMemo, useState } from "react";
import { Save, ShieldAlert, RefreshCcw } from "lucide-react";
import AdminLayout from "./AdminLayout";
import ToggleSwitch from "./ToggleSwitch";
import api from "../../lib/api";
import { useToast } from "../Toast/ToastProvider";
import { AUTH_STORAGE_KEYS } from "../../utils/auth";
import { useSettings } from "../../contexts/SettingsContext";
import { useWorkspaceAccess } from "../../context/WorkspaceAccessContext";
import {
  DEFAULT_SESSION_TIMEOUT,
  formatSessionTimeoutSummary,
  normalizeSessionTimeoutSettings,
  sessionTimeoutToMs,
} from "../../lib/sessionTimeout";

const TIMEOUT_UNITS = [
  { value: "minute", label: "Minutes" },
  { value: "hour", label: "Hours" },
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
];

const INITIAL_FORM = {
  sessionTimeoutEnabled: DEFAULT_SESSION_TIMEOUT.sessionTimeoutEnabled,
  sessionTimeoutValue: DEFAULT_SESSION_TIMEOUT.sessionTimeoutValue,
  sessionTimeoutUnit: DEFAULT_SESSION_TIMEOUT.sessionTimeoutUnit,
};

const AdminSettings = () => {
  const { showToast } = useToast();
  const { refreshSettings } = useSettings();
  const { refreshAccess } = useWorkspaceAccess();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const summary = useMemo(
    () => formatSessionTimeoutSummary(form),
    [form],
  );

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/api/admin/settings/session-timeout");
      const sessionTimeout = normalizeSessionTimeoutSettings(data?.data || {});

      setForm({
        sessionTimeoutEnabled: sessionTimeout.sessionTimeoutEnabled,
        sessionTimeoutValue: sessionTimeout.sessionTimeoutValue,
        sessionTimeoutUnit: sessionTimeout.sessionTimeoutUnit,
      });
    } catch (err) {
      console.error("Failed to load session timeout settings:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load the session timeout settings right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const validateForm = () => {
    const value = Number(form.sessionTimeoutValue);

    if (!Number.isInteger(value) || value < 1) {
      return "Timeout value must be a positive whole number.";
    }

    if (!["minute", "hour", "day", "week"].includes(form.sessionTimeoutUnit)) {
      return "Please choose a valid timeout unit.";
    }

    if (!sessionTimeoutToMs(value, form.sessionTimeoutUnit)) {
      return "The selected timeout is too large.";
    }

    return "";
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        sessionTimeoutEnabled: Boolean(form.sessionTimeoutEnabled),
        sessionTimeoutValue: Number(form.sessionTimeoutValue),
        sessionTimeoutUnit: form.sessionTimeoutUnit,
      };

      const { data } = await api.patch(
        "/api/admin/settings/session-timeout",
        payload,
      );

      const sessionTimeout = normalizeSessionTimeoutSettings(data?.data || payload);
      setForm({
        sessionTimeoutEnabled: sessionTimeout.sessionTimeoutEnabled,
        sessionTimeoutValue: sessionTimeout.sessionTimeoutValue,
        sessionTimeoutUnit: sessionTimeout.sessionTimeoutUnit,
      });

      localStorage.setItem(
        AUTH_STORAGE_KEYS.workspaceSettingsUpdatedAt,
        String(Date.now()),
      );
      refreshSettings();
      refreshAccess();

      showToast({
        title: "Settings saved",
        message: "Session timeout settings updated successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to save session timeout settings:", err);
      const message =
        err.response?.data?.message ||
        "Unable to save the session timeout settings.";
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

  return (
    <AdminLayout
      title="Settings"
      subtitle="Configure the workspace-wide inactivity session timeout."
    >
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/55 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.9)] backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-200">
              <ShieldAlert size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
                Security controls
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Session Timeout Settings
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Automatically log out inactive users after the configured
                duration.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSave}
          className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.9)] backdrop-blur"
        >
          {loading ? (
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
              <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
              <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Enable Inactivity Timeout
                    </p>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                      When disabled, inactivity auto-logout will not run.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={form.sessionTimeoutEnabled}
                    disabled={saving}
                    loading={saving}
                    onChange={(next) =>
                      setForm((current) => ({
                        ...current,
                        sessionTimeoutEnabled: next,
                      }))
                    }
                    label="Enable inactivity timeout"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Timeout Value
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={form.sessionTimeoutValue}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sessionTimeoutValue: event.target.value === ""
                          ? ""
                          : Number(event.target.value),
                      }))
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                    placeholder="30"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Accepts positive whole numbers only.
                  </p>
                </label>

                <label className="block rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Timeout Unit
                  </span>
                  <select
                    value={form.sessionTimeoutUnit}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sessionTimeoutUnit: event.target.value,
                      }))
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  >
                    {TIMEOUT_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-500">
                    Choose minutes, hours, days, or weeks.
                  </p>
                </label>
              </div>

              <div className="rounded-3xl border border-cyan-400/15 bg-cyan-500/8 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">
                  Summary
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  {summary}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={loadSettings}
                  disabled={loading || saving}
                >
                  <RefreshCcw size={16} />
                  Reload
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading || saving}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
