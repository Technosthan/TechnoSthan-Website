import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import api from "../../lib/api";
import { useToast } from "../Toast/ToastProvider";
import AdminLayout from "./AdminLayout";
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
  const [startAt, setStartAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [button1Text, setButton1Text] = useState("");
  const [button1Url, setButton1Url] = useState("");
  const [button2Text, setButton2Text] = useState("");
  const [button2Url, setButton2Url] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [replaceCampaign, setReplaceCampaign] = useState(null);

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
    setStartAt("");
    setExpiresAt("");
    setRedirectUrl("");
    setButton1Text("");
    setButton1Url("");
    setButton2Text("");
    setButton2Url("");
    setIsActive(true);
    setReplaceCampaign(null);
    setError(null);
    setEditingCampaign(null);
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
  };

  const validateCampaignTiming = () => {
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
    if (button1Url && button1Url.trim()) {
      try {
        if (!button1Url.startsWith("/")) new URL(button1Url);
      } catch {
        return "Button 1 URL is invalid.";
      }
    }
    if (button2Url && button2Url.trim()) {
      try {
        if (!button2Url.startsWith("/")) new URL(button2Url);
      } catch {
        return "Button 2 URL is invalid.";
      }
    }
    return null;
  };

  const appendCampaignFields = (formData) => {
    if (startAt) formData.append("startAt", new Date(startAt).toISOString());
    if (expiresAt)
      formData.append("expiresAt", new Date(expiresAt).toISOString());
    const normalized = redirectUrl.trim()
      ? normalizeRedirectUrl(redirectUrl)
      : "";
    if (normalized) formData.append("redirectUrl", normalized);
    if (button1Text) formData.append("button1Text", button1Text);
    if (button1Url) formData.append("button1Url", button1Url);
    if (button2Text) formData.append("button2Text", button2Text);
    if (button2Url) formData.append("button2Url", button2Url);
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
          window.sessionStorage.removeItem("technosthan_campaign_closed_id");
          showToast({ title: "Campaign updated", type: "success" });
          resetForm();
          loadCampaigns();
        }
      } else {
        const { data } = await api.post("/api/campaigns", formData);
        if (data.success) {
          window.sessionStorage.removeItem("technosthan_campaign_closed_id");
          showToast({
            title: "Campaign uploaded",
            message: "New campaign has been added.",
            type: "success",
          });
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
        window.sessionStorage.removeItem("technosthan_campaign_closed_id");
        await api.delete(`/api/campaigns/${replaceCampaign._id}`);
        showToast({
          title: "Campaign replaced",
          message: "The campaign was swapped successfully.",
          type: "success",
        });
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
    setButton1Text(campaign.button1Text || "");
    setButton1Url(campaign.button1Url || "");
    setButton2Text(campaign.button2Text || "");
    setButton2Url(campaign.button2Url || "");
    setIsActive(Boolean(campaign.isActive));
  };

  const cancelEdit = () => {
    resetForm();
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
              <span className="status-chip">{campaignCountLabel}</span>
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
              <label className="field-label" htmlFor="campaign-button1-text">
                Button 1 Text (optional)
              </label>
              <input
                id="campaign-button1-text"
                type="text"
                value={button1Text}
                onChange={(e) => setButton1Text(e.target.value)}
                className="select-control"
                placeholder="Learn more"
                disabled={saving}
              />
            </div>
            <div className="field-set">
              <label className="field-label" htmlFor="campaign-button1-url">
                Button 1 URL (optional)
              </label>
              <input
                id="campaign-button1-url"
                type="url"
                value={button1Url}
                onChange={(e) => setButton1Url(e.target.value)}
                className="select-control"
                placeholder="/pricing or https://example.com/pricing"
                disabled={saving}
              />
            </div>

            <div className="field-set">
              <label className="field-label" htmlFor="campaign-button2-text">
                Button 2 Text (optional)
              </label>
              <input
                id="campaign-button2-text"
                type="text"
                value={button2Text}
                onChange={(e) => setButton2Text(e.target.value)}
                className="select-control"
                placeholder="Sign up"
                disabled={saving}
              />
            </div>
            <div className="field-set">
              <label className="field-label" htmlFor="campaign-button2-url">
                Button 2 URL (optional)
              </label>
              <input
                id="campaign-button2-url"
                type="url"
                value={button2Url}
                onChange={(e) => setButton2Url(e.target.value)}
                className="select-control"
                placeholder="/signup or https://example.com/signup"
                disabled={saving}
              />
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
                    : "Uploading..."
                  : editingCampaign
                    ? "Update Campaign"
                    : "Upload Campaign"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="button button-secondary"
              >
                {editingCampaign ? "Cancel Edit" : "Clear"}
              </button>
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
