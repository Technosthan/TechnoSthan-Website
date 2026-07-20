import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  UploadCloud,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import api from "../../lib/api";
import { useToast } from "../Toast/ToastProvider";
import BusinessVerticalImage from "../BusinessVerticalImage";
import {
  BUSINESS_VERTICALS_UPDATED_EVENT,
  BUSINESS_VERTICALS_UPDATED_STORAGE_KEY,
  resolveBusinessVerticalImageSrc,
} from "../../lib/businessVerticalUtils";
import useAutoDraft from "../../hooks/useAutoDraft";
import {
  buildDraftKey,
  clearDraft,
  getCurrentDraftUserId,
} from "../../shared/lib/draftPersistence";
import { getStoredUser } from "../../utils/auth";
import "./BusinessVerticals.css";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/svg+xml",
];

const BusinessVerticals = () => {
  const { showToast } = useToast();
  const [verticals, setVerticals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const recoveryHandledRef = useRef(false);
  const draftUserId = getCurrentDraftUserId(getStoredUser());
  const draftKey = useMemo(
    () =>
      buildDraftKey({
        module: "business-vertical",
        mode: editingId ? "edit" : "create",
        recordId: editingId || "new",
        userId: draftUserId,
      }),
    [draftUserId, editingId],
  );
  const draftData = useMemo(
    () => ({
      title,
      description,
      editingId,
      fileMeta: file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          }
        : null,
    }),
    [description, editingId, file, title],
  );
  const {
    draftSnapshot,
    draftStatus,
    draftError,
    restoreDraft,
    discardDraft,
    markRecoveryHandled,
  } = useAutoDraft({
    key: draftKey,
    data: draftData,
    enabled: true,
    module: "business-vertical",
    mode: editingId ? "edit" : "create",
    recordId: editingId || "new",
    userId: draftUserId,
  });

  useEffect(() => {
    recoveryHandledRef.current = false;
  }, [draftKey]);

  const loadVerticals = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/business-verticals", {
        headers: {
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        },
      });
      if (data.success) {
        setVerticals(data.data || []);
      }
    } catch (err) {
      console.error("Unable to load business verticals", err);
      setError("Unable to load business verticals. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerticals();
  }, []);

  useEffect(() => {
    if (!file) {
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const triggerVerticalsRefresh = () => {
    window.dispatchEvent(new Event(BUSINESS_VERTICALS_UPDATED_EVENT));
    try {
      window.localStorage.setItem(
        BUSINESS_VERTICALS_UPDATED_STORAGE_KEY,
        String(Date.now()),
      );
    } catch (storageError) {
      console.warn("Unable to persist business vertical refresh signal", storageError);
    }
  };

  const resolveImageUrl = (item) => resolveBusinessVerticalImageSrc(item);

  const resetForm = () => {
    setError("");
    setTitle("");
    setDescription("");
    setFile(null);
    setPreview(null);
    setEditingId(null);
    clearDraft(draftKey);
  };

  const handleFileChange = (event) => {
    setError("");
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setError("Please upload JPG, PNG, WEBP, or SVG image file.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleEdit = (vertical) => {
    if (vertical.isDefault) return;
    setEditingId(vertical._id);
    setTitle(vertical.title || "");
    setDescription(vertical.description || "");
    setPreview(resolveImageUrl(vertical));
    setFile(null);
    setError("");
    recoveryHandledRef.current = false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    if (!editingId && !file) {
      setError("Image is required for a new vertical.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      if (file) {
        formData.append("image", file);
      }

      let response;
      if (editingId) {
        response = await api.put(
          `/api/admin/business-verticals/${editingId}`,
          formData,
        );
      } else {
        response = await api.post("/api/admin/business-verticals", formData);
      }

      if (response.data.success) {
        showToast({
          title: editingId ? "Vertical updated" : "Vertical added",
          type: "success",
        });
        clearDraft(draftKey);
        resetForm();
        await loadVerticals();
        triggerVerticalsRefresh();
      }
    } catch (err) {
      console.error("Unable to save business vertical", err);
      const message =
        err?.response?.data?.message || "Unable to save business vertical.";
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

  const handleToggleActive = async (vertical) => {
    if (vertical.isDefault) return;

    try {
      setSaving(true);
      const { data } = await api.patch(
        `/api/admin/business-verticals/${vertical._id}/toggle-active`,
        { isActive: !vertical.isActive },
      );
      if (data.success) {
        setVerticals((prev) =>
          prev.map((item) =>
            item._id === vertical._id
              ? {
                  ...item,
                  isActive: data.data.isActive,
                }
              : item,
          ),
        );
        showToast({
          title: data.data.isActive ? "Activated" : "Deactivated",
          type: "success",
        });
        triggerVerticalsRefresh();
      }
    } catch (err) {
      console.error("Unable to update active state", err);
      showToast({
        title: "Update failed",
        message:
          err?.response?.data?.message || "Unable to update active state.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vertical) => {
    if (vertical.isDefault) return;

    if (
      !window.confirm(
        `Delete vertical "${vertical.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/api/admin/business-verticals/${vertical._id}`);
      setVerticals((prev) => prev.filter((item) => item._id !== vertical._id));
      showToast({ title: "Vertical deleted", type: "success" });
      triggerVerticalsRefresh();
    } catch (err) {
      console.error("Unable to delete business vertical", err);
      showToast({
        title: "Delete failed",
        message: err?.response?.data?.message || "Unable to delete vertical.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const sortedVerticals = verticals
    .slice()
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <AdminLayout
      title="Business Verticals"
      subtitle="Manage the public business vertical cards shown on the website."
    >
      <div className="business-verticals-page space-y-8 pb-24">
        <div className="business-verticals-header rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                Business Verticals
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">
                Add, edit, and organize vertical cards for the public site.
              </h1>
            </div>
            <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              Default verticals cannot be deleted or deactivated.
            </div>
          </div>
        </div>

        <div className="business-verticals-grid">
          <section className="verticals-list-panel rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="section-title-wrapper">
              <div>
                <h2 className="section-title">All Business Verticals</h2>
                <p className="section-subtitle">
                  Default cards always remain visible. Custom cards can be
                  added, edited, and removed.
                </p>
              </div>
            </div>

            <div className="verticals-list">
              {loading ? (
                <div className="loading-box">Loading verticals…</div>
              ) : sortedVerticals.length === 0 ? (
                <div className="empty-state-card">
                  No custom verticals have been added yet. Add a new vertical to
                  display it on the public site.
                </div>
              ) : (
                sortedVerticals.map((vertical) => {
                  const imageUrl = resolveImageUrl(vertical);
                  return (
                    <div key={vertical._id} className="vertical-item-card">
                      <BusinessVerticalImage
                        vertical={{ ...vertical, imageUrl }}
                        alt={vertical.title}
                        className="vertical-item-image-wrap"
                        imageClassName="vertical-item-image"
                      />
                      <div className="vertical-item-body">
                        <div className="vertical-item-title-row">
                          <h3>{vertical.title}</h3>
                          {vertical.isDefault && (
                            <span className="badge badge-default">Default</span>
                          )}
                          {!vertical.isDefault && !vertical.isActive && (
                            <span className="badge badge-inactive">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p>{vertical.description}</p>
                      </div>
                      <div className="vertical-item-actions">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleEdit(vertical)}
                          disabled={vertical.isDefault || saving}
                          title={
                            vertical.isDefault
                              ? "Default vertical cannot be edited"
                              : "Edit vertical"
                          }
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleToggleActive(vertical)}
                          disabled={vertical.isDefault || saving}
                          title={
                            vertical.isDefault
                              ? "Default vertical cannot be deactivated"
                              : vertical.isActive
                                ? "Deactivate vertical"
                                : "Activate vertical"
                          }
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          type="button"
                          className="icon-button text-rose-300 hover:text-rose-100"
                          onClick={() => handleDelete(vertical)}
                          disabled={vertical.isDefault || saving}
                          title={
                            vertical.isDefault
                              ? "Default vertical cannot be deleted"
                              : "Delete vertical"
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="verticals-form-panel rounded-3xl border border-white/10 bg-slate-950/80 p-6">
            <div className="section-title-wrapper">
              <div>
                <h2 className="section-title">
                  {editingId ? "Edit Vertical" : "Add New Vertical"}
                </h2>
                <p className="section-subtitle">
                  Upload an image, set a title, and provide a short description.
                </p>
              </div>
            </div>

            <form className="verticals-form" onSubmit={handleSubmit}>
              {error && <div className="error-banner">{error}</div>}
              {!error && draftError && (
                <div className="error-banner">{draftError}</div>
              )}

              <div className="field-group">
                <label htmlFor="vertical-title">Title</label>
                <input
                  id="vertical-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter vertical title"
                  disabled={saving}
                />
              </div>

              <div className="field-group">
                <label htmlFor="vertical-description">Description</label>
                <textarea
                  id="vertical-description"
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter vertical description"
                  disabled={saving}
                />
              </div>

              <div className="field-group">
                <label htmlFor="vertical-image">Image / Logo</label>
                <input
                  id="vertical-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={saving}
                />
                <p className="field-help">
                  JPG, PNG, WEBP, or SVG. Recommended size: 400x400px.
                </p>
              </div>

              {preview && (
                <div className="image-preview-card">
                  <img src={preview} alt="Preview" />
                  <div className="preview-badge">
                    <UploadCloud size={16} /> Preview
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Plus size={16} />
                  {editingId ? "Save Changes" : "Add Vertical"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                )}
                <div className="ml-auto self-center text-xs text-slate-400">
                  {draftStatus === "saved"
                    ? "Draft saved"
                    : draftStatus === "restored"
                      ? "Draft restored"
                      : draftStatus === "external-update"
                        ? "This draft was updated in another tab."
                        : ""}
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BusinessVerticals;
