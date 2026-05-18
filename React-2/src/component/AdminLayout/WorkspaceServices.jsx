import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredToken } from "../../utils/auth";

// User-friendly labels and grouping
const SECTIONS = [
  {
    id: "assignments",
    title: "Assignment System",
    description:
      "Controls assignment creation, reviews and submission behaviors.",
    items: [
      {
        key: "assignmentsEnabled",
        label: "Enable Assignments",
        default: false,
      },
      {
        key: "assignmentReviewsEnabled",
        label: "Enable Reviews",
        default: false,
      },
      {
        key: "assignmentFileAttachmentsEnabled",
        label: "Enable File Attachments",
        default: false,
      },
      {
        key: "assignmentDeadlineExtensionsEnabled",
        label: "Enable Deadline Extensions",
        default: false,
      },
      { key: "revisionsEnabled", label: "Enable Revisions", default: false },
    ],
  },

  {
    id: "hr",
    title: "HR Controls",
    description: "Permissions and actions available to HR users.",
    items: [
      {
        key: "hrCanCreateAssignments",
        label: "HR Can Create Assignments",
        default: false,
      },
      {
        key: "hrCanEditOwnAssignments",
        label: "HR Can Edit Own Assignments",
        default: false,
      },
      {
        key: "hrCanDeleteAssignments",
        label: "HR Can Delete Assignments",
        default: false,
      },
      {
        key: "hrCanReviewSubmissions",
        label: "HR Can Review Submissions",
        default: false,
      },
    ],
  },

  {
    id: "users",
    title: "User Controls",
    description: "What regular users can do in the workspace.",
    items: [
      {
        key: "usersCanSubmitAssignments",
        label: "Users Can Submit Work",
        default: false,
      },
      {
        key: "usersCanUploadFiles",
        label: "Users Can Upload Files",
        default: false,
      },
      {
        key: "usersCanCreateSocialPosts",
        label: "Users Can Create Social Posts",
        default: false,
      },
      {
        key: "usersCanCustomizePlatforms",
        label: "User Workspace Customization",
        default: false,
      },
    ],
  },

  {
    id: "social",
    title: "Social Platforms",
    description: "Enable or disable platform integrations and dispatching.",
    items: [
      { key: "socialPostingEnabled", label: "Social Posting", default: false },
      { key: "whatsappEnabled", label: "WhatsApp", default: false },
      { key: "linkedinEnabled", label: "LinkedIn", default: false },
      { key: "instagramEnabled", label: "Instagram", default: false },
      {
        key: "platformDispatchEnabled",
        label: "Platform Dispatch",
        default: false,
      },
    ],
  },

  {
    id: "platforms",
    title: "Platform & Analytics",
    description: "Controls platform grid, tracking and analytics.",
    items: [
      { key: "platformGridEnabled", label: "Platform Grid", default: false },
      { key: "shareTrackingEnabled", label: "Share Tracking", default: false },
      { key: "usageTrackingEnabled", label: "Usage Tracking", default: false },
      { key: "analyticsEnabled", label: "Analytics", default: false },
    ],
  },

  {
    id: "security",
    title: "Security & Management",
    description: "Workspace-level account and role controls.",
    items: [
      {
        key: "allowUserRegistration",
        label: "User Registration",
        default: false,
      },
      { key: "allowHRCreation", label: "HR Creation", default: false },
      { key: "allowRoleEditing", label: "Role Editing", default: false },
      { key: "allowUserSuspension", label: "User Suspension", default: false },
      {
        key: "allowAccountDeletion",
        label: "Account Deletion",
        default: false,
      },
    ],
  },
];

const DEFAULT_OVERRIDES = SECTIONS.reduce((acc, s) => {
  s.items.forEach((it) => (acc[it.key] = it.default));
  return acc;
}, {});

const PERMISSION_MATRIX = [
  {
    id: "create_assignments",
    label: "Create Assignments",
    keys: {
      admin: "assignmentsEnabled",
      hr: "hrCanCreateAssignments",
      user: null,
    },
  },
  {
    id: "edit_assignments",
    label: "Edit Assignments",
    keys: {
      admin: "assignmentsEnabled",
      hr: "hrCanEditOwnAssignments",
      user: "usersCanEditSubmissions",
    },
  },
  {
    id: "delete_assignments",
    label: "Delete Assignments",
    keys: {
      admin: "assignmentsEnabled",
      hr: "hrCanDeleteAssignments",
      user: null,
    },
  },
  {
    id: "review_submissions",
    label: "Review Submissions",
    keys: {
      admin: "assignmentReviewsEnabled",
      hr: "hrCanReviewSubmissions",
      user: null,
    },
  },
  {
    id: "upload_files",
    label: "Upload Files",
    keys: {
      admin: "fileUploadsEnabled",
      hr: "fileUploadsEnabled",
      user: "usersCanUploadFiles",
    },
  },
  {
    id: "create_social",
    label: "Create Social Posts",
    keys: {
      admin: "socialPostingEnabled",
      hr: "socialPostingEnabled",
      user: "usersCanCreateSocialPosts",
    },
  },
  {
    id: "manage_platforms",
    label: "Manage Platforms",
    keys: {
      admin: "platformGridEnabled",
      hr: "platformGridEnabled",
      user: "usersCanCustomizePlatforms",
    },
  },
];

const WorkspaceServices = () => {
  const [settings, setSettings] = useState(null);
  const [editState, setEditState] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const normalizeSettings = (raw) => {
    // raw may be a partial public view; ensure all keys exist and booleans are not undefined
    const normalized = { ...DEFAULT_OVERRIDES };
    if (!raw) return normalized;
    Object.keys(normalized).forEach((k) => {
      const v = raw[k];
      normalized[k] = typeof v === "boolean" ? v : normalized[k];
    });
    return { ...normalized, ...(raw || {}) };
  };

  const fetchSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = getStoredToken();
      // Prefer admin endpoint (returns full settings) for admins
      let res;
      if (token) {
        res = await fetch(`${API_BASE}/api/admin/workspace-services`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!res || !res.ok) {
        // fallback to public settings
        const pub = await fetch(`${API_BASE}/api/settings`);
        if (!pub.ok) throw new Error("Failed to load settings");
        const data = await pub.json();
        const normalized = normalizeSettings(data);
        setSettings(normalized);
        setEditState(normalized);
        return;
      }

      const data = await res.json();
      const normalized = normalizeSettings(data.settings || data);
      setSettings(normalized);
      setEditState(normalized);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = (key, value) =>
    setEditState((s) => ({ ...s, [key]: value }));

  const isDirty = useMemo(() => {
    if (!settings) return false;
    return Object.keys(DEFAULT_OVERRIDES).some(
      (k) => settings[k] !== editState[k],
    );
  }, [settings, editState]);

  const handleSave = async () => {
    const token = getStoredToken();
    if (!token) {
      setMessage({ type: "error", text: "Not authenticated as admin" });
      return;
    }

    const updates = {};
    Object.keys(DEFAULT_OVERRIDES).forEach((k) => {
      if (settings[k] !== editState[k]) updates[k] = editState[k];
    });
    if (Object.keys(updates).length === 0) {
      setMessage({ type: "info", text: "No changes to save" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/workspace-services`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || "Failed to save settings");
      }
      await fetchSettings();
      setMessage({ type: "success", text: "Settings saved" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    const ok = window.confirm(
      "Restore workspace defaults? This will overwrite current toggles.",
    );
    if (!ok) return;
    const token = getStoredToken();
    if (!token)
      return setMessage({ type: "error", text: "Not authenticated as admin" });
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/admin/workspace-services`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(DEFAULT_OVERRIDES),
      });
      await fetchSettings();
      setMessage({ type: "success", text: "Defaults restored" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const renderToggle = (item) => {
    const val =
      typeof editState[item.key] === "boolean"
        ? editState[item.key]
        : item.default;
    return (
      <div className="flex items-center justify-between gap-4" key={item.key}>
        <div>
          <div className="text-sm font-medium text-slate-100">{item.label}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-300">
            {val ? "Enabled" : "Disabled"}
          </div>
          <button
            onClick={() => setValue(item.key, !val)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${val ? "bg-indigo-600" : "bg-slate-700"}`}
            aria-pressed={val}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${val ? "translate-x-5" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>
    );
  };

  const renderSection = (section) => (
    <div key={section.id} className="rounded-lg bg-slate-800 p-4">
      <div className="mb-3">
        <div className="text-lg font-semibold">{section.title}</div>
        <div className="text-sm text-slate-400">{section.description}</div>
      </div>

      <div className="space-y-3">
        {section.items.map((it) => renderToggle(it))}
      </div>
    </div>
  );

  const renderPermissionCell = (roleKey, row) => {
    const key = row.keys[roleKey];
    if (!key) return <div className="text-slate-500">—</div>;
    const val = Boolean(editState?.[key]);
    return <div className="text-center">{val ? "✅" : "❌"}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">
              Workspace Services & Role Permission Center
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Enterprise controls for features, platform integrations and role
              permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="rounded-full bg-slate-700 px-4 py-2 text-sm"
            >
              Back
            </button>
            <button
              onClick={handleResetDefaults}
              disabled={loading}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm"
            >
              Restore Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || loading}
              className={`rounded-full px-4 py-2 text-sm ${isDirty ? "bg-emerald-600" : "bg-slate-700"}`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </header>

        {message && (
          <div
            className={`mb-4 rounded-md p-3 ${message.type === "error" ? "bg-rose-800" : "bg-emerald-900"}`}
          >
            <div className="text-sm">{message.text}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SECTIONS.map(renderSection)}
        </div>

        <div className="mt-6 rounded-lg bg-slate-800 p-4">
          <div className="mb-3">
            <div className="text-lg font-semibold">Role Permission Matrix</div>
            <div className="text-sm text-slate-400">
              Quick view of what each role can do based on current toggles and
              workspace rules.
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="w-1/2">Permission</th>
                  <th className="w-1/6 text-center">ADMIN</th>
                  <th className="w-1/6 text-center">HR</th>
                  <th className="w-1/6 text-center">USER</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700">
                {PERMISSION_MATRIX.map((row) => (
                  <tr key={row.id} className="h-12">
                    <td className="pr-4 text-slate-200">{row.label}</td>
                    <td>{renderPermissionCell("admin", row)}</td>
                    <td>{renderPermissionCell("hr", row)}</td>
                    <td>{renderPermissionCell("user", row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceServices;
