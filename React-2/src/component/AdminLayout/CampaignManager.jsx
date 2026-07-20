import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import api from "../../lib/api";
import {
  formatCampaignRoute,
  normalizeCampaignRouteInput,
} from "../../lib/campaignRoutes";
import { useToast } from "../Toast/ToastProvider";
import AdminLayout from "./AdminLayout";
import useAutoDraft from "../../hooks/useAutoDraft";
import {
  buildDraftKey,
  clearDraft,
  getCurrentDraftUserId,
} from "../../shared/lib/draftPersistence";
import { getStoredUser } from "../../utils/auth";
import "./CampaignManager.css";

const parseDateTimeValue = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const normalizeRedirectUrl = (value) => {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed;
  const parsed = new URL(trimmed);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Redirect URL must use http or https");
  }
  return parsed.toString();
};

const normalizeCampaignButtonUrl = (value, index) => {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    throw new Error(`Campaign button ${index} URL is required.`);
  }
  if (trimmed.startsWith("/")) return trimmed;
  const parsed = new URL(trimmed);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Campaign button ${index} URL must use http or https.`);
  }
  return parsed.toString();
};

const normalizeCampaignButtons = (buttons = []) =>
  buttons
    .map((button, index) => {
      const text = String(button?.text || "").trim();
      const url = String(button?.url || "").trim();

      if (!text && !url) {
        return null;
      }

      if (!text) {
        throw new Error(`Campaign button ${index + 1} text is required.`);
      }

      return {
        text,
        url: normalizeCampaignButtonUrl(url, index + 1),
      };
    })
    .filter(Boolean);

const getCampaignState = (campaign, now) => {
  const startAt = campaign.startAt
    ? new Date(campaign.startAt).getTime()
    : null;
  const expiresAt = campaign.expiresAt
    ? new Date(campaign.expiresAt).getTime()
    : null;
  const nowMs = now.getTime();
  const isExpired = Number.isFinite(expiresAt) && expiresAt <= nowMs;
  const isLive =
    Boolean(campaign.isActive) &&
    (startAt === null || !Number.isFinite(startAt) || startAt <= nowMs) &&
    !isExpired;

  return {
    isExpired,
    isLive,
    label: isExpired ? "Expired" : isLive ? "Active" : "Inactive",
    className: isExpired
      ? "status-pill--expired"
      : isLive
        ? "status-pill--active"
        : "status-pill--inactive",
  };
};

const CampaignManager = () => {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [displayRoute, setDisplayRoute] = useState("");
  const [startAt, setStartAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [campaignButtons, setCampaignButtons] = useState([
    { text: "", url: "" },
    { text: "", url: "" },
  ]);
  const [isActive, setIsActive] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [replaceCampaign, setReplaceCampaign] = useState(null);
  const fileInputRef = useRef(null);
  const recoveryHandledRef = useRef(false);
  const draftUserId = getCurrentDraftUserId(getStoredUser());
  const draftKey = useMemo(
    () =>
      buildDraftKey({
        module: "campaign",
        mode: editingCampaign ? "edit" : "create",
        recordId: editingCampaign?._id || "new",
        userId: draftUserId,
      }),
    [draftUserId, editingCampaign],
  );
  const draftData = useMemo(
    () => ({
      displayRoute,
      startAt,
      expiresAt,
      redirectUrl,
      campaignButtons,
      isActive,
      editingCampaignId: editingCampaign?._id || null,
      editingCampaignMediaUrl: editingCampaign?.mediaUrl || "",
      replaceCampaignId: replaceCampaign?._id || null,
      replaceCampaignMediaUrl: replaceCampaign?.mediaUrl || "",
      replaceCampaignIsActive: replaceCampaign?.isActive ?? null,
      fileMeta: file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          }
        : null,
    }),
    [
      campaignButtons,
      displayRoute,
      editingCampaign,
      expiresAt,
      file,
      isActive,
      redirectUrl,
      replaceCampaign,
      startAt,
    ],
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
    module: "campaign",
    mode: editingCampaign ? "edit" : "create",
    recordId: editingCampaign?._id || "new",
    userId: draftUserId,
  });

  useEffect(() => {
    recoveryHandledRef.current = false;
  }, [draftKey]);

  // editing mode uses same left form
  const [editingCampaign, setEditingCampaign] = useState(null);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/campaigns");
      if (data.success) setCampaigns(data.data || []);
    } catch (err) {
      console.error("Unable to load campaigns", err);
      setError("Unable to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (editingCampaign && editingCampaign.mediaUrl) {
      setPreview(editingCampaign.mediaUrl);
      return undefined;
    }
    setPreview(null);
    return undefined;
  }, [file, editingCampaign]);

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setDisplayRoute("");
    setStartAt("");
    setExpiresAt("");
    setRedirectUrl("");
    setCampaignButtons([
      { text: "", url: "" },
      { text: "", url: "" },
    ]);
    setIsActive(true);
    setReplaceCampaign(null);
    setError(null);
    setEditingCampaign(null);
    clearDraft(draftKey);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    if (!allowed.includes(selected.type)) {
      setError("Please upload a JPG, PNG, WEBP, MP4 or WEBM file.");
      setFile(null);
      return;
    }
    setFile(selected);
    recoveryHandledRef.current = false;
  };

  const validateCampaignTiming = () => {
    try {
      normalizeCampaignRouteInput(displayRoute);
    } catch (err) {
      return err.message || "Please enter a valid display route.";
    }

    const parsedStart = parseDateTimeValue(startAt);
    const parsedExpires = parseDateTimeValue(expiresAt);
    if (startAt && !parsedStart)
      return "Please enter a valid start date and time.";
    if (expiresAt && !parsedExpires)
      return "Please enter a valid expiry date and time.";
    if (parsedStart && parsedExpires && parsedExpires <= parsedStart)
      return "Expiry date and time must be later than the start date and time.";
    if (redirectUrl.trim()) {
      try {
        normalizeRedirectUrl(redirectUrl);
      } catch (err) {
        return err.message || "Please enter a valid redirect URL.";
      }
    }
    try {
      normalizeCampaignButtons(campaignButtons);
    } catch (err) {
      return err.message || "Please enter valid campaign buttons.";
    }
    return null;
  };

  const appendCampaignFields = (formData) => {
    formData.append(
      "displayRoute",
      normalizeCampaignRouteInput(displayRoute),
    );
    if (startAt) formData.append("startAt", new Date(startAt).toISOString());
    if (expiresAt)
      formData.append("expiresAt", new Date(expiresAt).toISOString());
    const normalized = redirectUrl.trim()
      ? normalizeRedirectUrl(redirectUrl)
      : "";
    if (normalized) formData.append("redirectUrl", normalized);
    formData.append(
      "campaignButtons",
      JSON.stringify(normalizeCampaignButtons(campaignButtons)),
    );
  };

  const submitCampaign = async () => {
    // create or update
    if (!editingCampaign && !file) {
      setError("Please select a campaign media file.");
      return;
    }
    const validationError = validateCampaignTiming();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const formData = new FormData();
      if (file) formData.append("media", file);
      formData.append("isActive", isActive ? "true" : "false");
      appendCampaignFields(formData);

      if (editingCampaign) {
        const { data } = await api.put(
          `/api/campaigns/${editingCampaign._id}`,
          formData,
        );
        if (data.success) {
          showToast({ title: "Campaign updated", type: "success" });
          clearDraft(draftKey);
          resetForm();
          loadCampaigns();
        }
      } else {
        const { data } = await api.post("/api/campaigns", formData);
        if (data.success) {
          showToast({
            title: "Campaign uploaded",
            message: "New campaign has been added.",
            type: "success",
          });
          clearDraft(draftKey);
          resetForm();
          loadCampaigns();
        }
      }
    } catch (err) {
      console.error("Save failed", err);
      setError(err?.response?.data?.message || "Unable to save campaign.");
      showToast({
        title: "Save failed",
        message: err?.response?.data?.message || "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const applyActivation = async (campaignId, active) => {
    try {
      setSaving(true);
      const { data } = await api.patch(`/api/campaigns/${campaignId}/toggle`, {
        isActive: active,
      });
      if (data.success) {
        showToast({
          title: active ? "Campaign activated" : "Campaign deactivated",
          type: "success",
        });
        loadCampaigns();
      }
    } catch (err) {
      console.error("Unable to update status", err);
      showToast({
        title: "Status update failed",
        message: "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeCampaign = async (campaignId) => {
    try {
      setSaving(true);
      const { data } = await api.delete(`/api/campaigns/${campaignId}`);
      if (data.success) {
        showToast({ title: "Campaign deleted", type: "success" });
        setCampaigns((p) => p.filter((c) => c._id !== campaignId));
      }
    } catch (err) {
      console.error("Unable to delete campaign", err);
      showToast({
        title: "Delete failed",
        message: "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const replaceExistingCampaign = async () => {
    if (!replaceCampaign) {
      setError("Select an existing campaign to replace.");
      return;
    }
    if (!file) {
      setError("Please choose a replacement file.");
      return;
    }
    const validationError = validateCampaignTiming();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("media", file);
      formData.append("isActive", replaceCampaign.isActive ? "true" : "false");
      appendCampaignFields(formData);
      const createResponse = await api.post("/api/campaigns", formData);
      if (createResponse.data.success) {
        await api.delete(`/api/campaigns/${replaceCampaign._id}`);
        showToast({
          title: "Campaign replaced",
          message: "The campaign was swapped successfully.",
          type: "success",
        });
        clearDraft(draftKey);
        resetForm();
        loadCampaigns();
      }
    } catch (err) {
      console.error("Replace failed", err);
      showToast({
        title: "Replace failed",
        message: "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFile(null);
    setPreview(campaign.mediaUrl || null);
    setDisplayRoute(formatCampaignRoute(campaign.displayRoute || "/"));
    setStartAt(
      campaign.startAt
        ? new Date(campaign.startAt).toISOString().slice(0, 16)
        : "",
    );
    setExpiresAt(
      campaign.expiresAt
        ? new Date(campaign.expiresAt).toISOString().slice(0, 16)
        : "",
    );
    setRedirectUrl(campaign.redirectUrl || "");
    const restoredButtons =
      Array.isArray(campaign.campaignButtons) && campaign.campaignButtons.length
        ? campaign.campaignButtons
        : [
            campaign.button1Text && campaign.button1Url
              ? { text: campaign.button1Text, url: campaign.button1Url }
              : null,
            campaign.button2Text && campaign.button2Url
              ? { text: campaign.button2Text, url: campaign.button2Url }
              : null,
          ].filter(Boolean);
    setCampaignButtons(
      restoredButtons.length ? restoredButtons : [{ text: "", url: "" }],
    );
    setIsActive(Boolean(campaign.isActive));
  };

  const cancelEdit = () => {
    resetForm();
  };

  const startNewCampaign = () => {
    resetForm();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const campaignCountLabel = useMemo(
    () => `${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`,
    [campaigns.length],
  );

  return (
    <AdminLayout
      title="Campaign Manager"
      subtitle="Upload and manage promotional campaigns that appear as a session-based popup across the website."
    >
      <div className="campaign-manager page-layout">
        <div className="campaign-manager__grid">
          <section className="card glass campaign-manager__form">
            <div className="section-header">
              <div>
                <p className="eyebrow">
                  {editingCampaign ? "Edit Campaign" : "Upload Campaign"}
                </p>
                <h2>
                  {editingCampaign
                    ? "Edit campaign details"
                    : "New campaign media"}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span className="status-chip">{campaignCountLabel}</span>
                <button
                  type="button"
                  onClick={startNewCampaign}
                  disabled={saving}
                  className="button button-secondary"
                >
                  Add Campaign
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="field-set">
              <label className="field-label" htmlFor="campaign-file">
                Choose image or video
              </label>
              <input
                id="campaign-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="file-input"
                disabled={saving}
              />
              <p className="field-help">
                Supported formats: JPG, PNG, WEBP, MP4, WEBM. Max 25 MB.
              </p>
            </div>

            {/* preview (either selected file or existing campaign media when editing) */}
            {preview && (
              <div className="media-preview">
                {file?.type?.startsWith("video/") ? (
                  <video
                    controls
                    muted
                    playsInline
                    loop
                    src={preview}
                    className="preview-media"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Campaign preview"
                    className="preview-media"
                  />
                )}
              </div>
            )}

            <div className="field-set">
              <label className="field-label" htmlFor="campaign-display-route">
                Display Route
              </label>
              <input
                id="campaign-display-route"
                type="text"
                value={displayRoute}
                onChange={(e) => setDisplayRoute(e.target.value)}
                onBlur={() => {
                  try {
                    setDisplayRoute(normalizeCampaignRouteInput(displayRoute));
                  } catch (err) {
                    // Let submit-time validation surface the error.
                  }
                }}
                className="select-control"
                placeholder="/contact or /programs/:slug"
                list="campaign-route-suggestions"
                disabled={saving}
                required
              />
              <datalist id="campaign-route-suggestions">
                {Array.from(
                  new Set(
                    campaigns
                      .map((campaign) =>
                        formatCampaignRoute(campaign.displayRoute || "/"),
                      )
                      .filter(Boolean),
                  ),
                ).map((route) => (
                  <option key={route} value={route} />
                ))}
              </datalist>
              <p className="field-help">
                Enter a website path only. Examples: /, /about, /contact,
                /programs, /programs/:slug.
              </p>
            </div>

            <div className="field-set">
              <label className="field-label" htmlFor="campaign-start-at">
                Start Date & Time
              </label>
              <input
                id="campaign-start-at"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="select-control"
                disabled={saving}
              />
            </div>

            <div className="field-set">
              <label className="field-label" htmlFor="campaign-expires-at">
                Expiry Date & Time
              </label>
              <input
                id="campaign-expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="select-control"
                disabled={saving}
              />
            </div>

            <div className="field-set">
              <label className="field-label" htmlFor="campaign-redirect-url">
                Redirect URL
              </label>
              <input
                id="campaign-redirect-url"
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="select-control"
                placeholder="/path or https://example.com"
                disabled={saving}
              />
            </div>

            <div className="field-set">
              <div className="replace-note" style={{ alignItems: "center" }}>
                <div>
                  <label className="field-label">Campaign Buttons</label>
                  <p className="field-help" style={{ margin: "0.25rem 0 0" }}>
                    Add as many buttons as you need. The first two remain
                    compatible with existing campaign data.
                  </p>
                </div>
                <button
                  type="button"
                  className="button button-secondary button-sm"
                  disabled={saving}
                  onClick={() =>
                    setCampaignButtons((prev) => [
                      ...prev,
                      { text: "", url: "" },
                    ])
                  }
                >
                  Add Campaign Button
                </button>
              </div>
              <div className="campaign-button-list">
                {campaignButtons.map((button, index) => (
                  <div key={index} className="campaign-button-row">
                    <div className="field-set" style={{ marginBottom: 0 }}>
                      <label
                        className="field-label"
                        htmlFor={`campaign-button-text-${index}`}
                      >
                        Button {index + 1} Text
                      </label>
                      <input
                        id={`campaign-button-text-${index}`}
                        type="text"
                        value={button.text}
                        onChange={(e) =>
                          setCampaignButtons((prev) =>
                            prev.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, text: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className="select-control"
                        placeholder={`Button ${index + 1} label`}
                        disabled={saving}
                      />
                    </div>
                    <div className="field-set" style={{ marginBottom: 0 }}>
                      <label
                        className="field-label"
                        htmlFor={`campaign-button-url-${index}`}
                      >
                        Button {index + 1} URL
                      </label>
                      <input
                        id={`campaign-button-url-${index}`}
                        type="url"
                        value={button.url}
                        onChange={(e) =>
                          setCampaignButtons((prev) =>
                            prev.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, url: e.target.value }
                                : item,
                            ),
                          )
                        }
                        className="select-control"
                        placeholder="/pricing or https://example.com/pricing"
                        disabled={saving}
                      />
                    </div>
                    {campaignButtons.length > 1 && (
                      <button
                        type="button"
                        className="button button-secondary button-sm"
                        disabled={saving}
                        onClick={() =>
                          setCampaignButtons((prev) =>
                            prev.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="field-set">
              <label className="field-label">Active</label>
              <label className="toggle-filter">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />{" "}
                <span style={{ marginLeft: 8 }}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={submitCampaign}
                disabled={saving || (!editingCampaign && !file)}
                className="button button-primary"
              >
                <Plus size={16} />{" "}
                {saving
                  ? editingCampaign
                    ? "Saving..."
                    : "Adding..."
                  : editingCampaign
                    ? "Update Campaign"
                    : "Add Campaign"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="button button-secondary"
              >
                {editingCampaign ? "Cancel Edit" : "Clear"}
              </button>
              <div className="ml-auto self-center text-xs text-slate-400">
                {draftError
                  ? draftError
                  : draftStatus === "saved"
                    ? "Draft saved"
                    : draftStatus === "restored"
                      ? "Draft restored"
                      : draftStatus === "external-update"
                        ? "This draft was updated in another tab."
                        : ""}
              </div>
            </div>

            <div className="replace-block">
              <div className="replace-note">
                <div className="replace-icon">
                  <ArrowUpDown size={18} />
                </div>
                <div>
                  <p className="replace-title">Replace existing campaign</p>
                  <p className="replace-description">
                    Select any existing campaign and upload a new file to swap
                    it instantly.
                  </p>
                </div>
              </div>
              <div className="replace-actions">
                <select
                  value={replaceCampaign?._id || ""}
                  onChange={(e) => {
                    const sel = campaigns.find((c) => c._id === e.target.value);
                    setReplaceCampaign(sel || null);
                    if (sel) {
                      setDisplayRoute(
                        formatCampaignRoute(sel.displayRoute || "/"),
                      );
                    }
                  }}
                  className="select-control"
                  disabled={saving || campaigns.length === 0}
                >
                  <option value="">Replace an existing campaign</option>
                  {campaigns.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.mediaType === "video" ? "Video" : "Image"} •{" "}
                      {new Date(c.createdAt).toLocaleString()}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={replaceExistingCampaign}
                  disabled={saving || !replaceCampaign || !file}
                  className="button button-secondary"
                >
                  Replace campaign
                </button>
              </div>
            </div>
          </section>

          <section className="card glass campaign-manager__list">
            <div className="section-header">
              <div>
                <p className="eyebrow">Campaign Library</p>
                <h2>Active and archived campaigns</h2>
              </div>
              <label className="toggle-filter">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                />{" "}
                <span>Show active only</span>
              </label>
            </div>

            {loading ? (
              <div className="gallery-loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="campaign-card shimmer" />
                ))}
              </div>
            ) : (
              <div className="campaign-grid">
                {(activeOnly
                  ? campaigns.filter((c) => getCampaignState(c, now).isLive)
                  : campaigns
                ).map((c) => {
                  const state = getCampaignState(c, now);
                  return (
                    <div key={c._id} className="campaign-card">
                      <div className="campaign-card__preview">
                        {c.mediaType === "video" ? (
                          <video
                            src={c.mediaUrl}
                            muted
                            loop
                            className="campaign-thumb"
                          />
                        ) : (
                          <img
                            src={c.mediaUrl}
                            alt="Campaign media"
                            className="campaign-thumb"
                          />
                        )}
                      </div>
                      <div className="campaign-card__body">
                        <div className="campaign-card__meta">
                          <span className={`status-pill ${state.className}`}>
                            {state.label}
                          </span>
                          <span className="campaign-type">
                            {c.mediaType === "video" ? "Video" : "Image"}
                          </span>
                        </div>
                        <p className="campaign-route">
                          Route: {formatCampaignRoute(c.displayRoute || "/")}
                        </p>
                        <p className="campaign-timestamp">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="campaign-card__actions">
                        <button
                          onClick={() => applyActivation(c._id, !c.isActive)}
                          disabled={saving}
                          className={`button button-sm ${c.isActive ? "button-secondary" : "button-primary"}`}
                        >
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          disabled={saving}
                          className="button button-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setReplaceCampaign(c);
                            setDisplayRoute(
                              formatCampaignRoute(c.displayRoute || "/"),
                            );
                            setError(null);
                          }}
                          disabled={saving}
                          className="button button-secondary"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => removeCampaign(c._id)}
                          disabled={saving}
                          className="button button-danger button-sm"
                          aria-label="Delete campaign"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CampaignManager;
