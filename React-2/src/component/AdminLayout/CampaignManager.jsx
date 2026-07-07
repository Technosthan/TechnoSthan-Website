import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, ArrowUpDown, X } from "lucide-react";
import api from "../../lib/api";
import { useToast } from "../Toast/ToastProvider";
import AdminLayout from "./AdminLayout";
import "./CampaignManager.css";

const parseDateTimeValue = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeRedirectUrl = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const parsedUrl = new URL(trimmed);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Redirect URL must use http or https");
  }

  return parsedUrl.toString();
};

const getCampaignState = (campaign, now) => {
  const startAt = campaign.startAt ? new Date(campaign.startAt).getTime() : null;
  const expiresAt = campaign.expiresAt ? new Date(campaign.expiresAt).getTime() : null;
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
  const [activeOnly, setActiveOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCampaignId, setActiveCampaignId] = useState(null);
  const [replaceCampaign, setReplaceCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => new Date());

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/campaigns");
      if (data.success) {
        setCampaigns(data.data || []);
      }
    } catch (err) {
      console.error("Unable to load campaigns", err);
      setError("Unable to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setReplaceCampaign(null);
    setStartAt("");
    setExpiresAt("");
    setRedirectUrl("");
    setError(null);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (event) => {
    setError(null);
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    if (!allowedTypes.includes(selected.type)) {
      setError("Please upload a JPG, PNG, WEBP, MP4 or WEBM file.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const validateCampaignTiming = () => {
    const parsedStartAt = parseDateTimeValue(startAt);
    const parsedExpiresAt = parseDateTimeValue(expiresAt);

    if (startAt && !parsedStartAt) {
      return "Please enter a valid start date and time.";
    }

    if (expiresAt && !parsedExpiresAt) {
      return "Please enter a valid expiry date and time.";
    }

    if (parsedStartAt && parsedExpiresAt && parsedExpiresAt <= parsedStartAt) {
      return "Expiry date and time must be later than the start date and time.";
    }

    if (redirectUrl.trim()) {
      try {
        normalizeRedirectUrl(redirectUrl);
      } catch (err) {
        return err.message || "Please enter a valid redirect URL.";
      }
    }

    return null;
  };

  const appendCampaignFields = (formData) => {
    if (startAt) {
      formData.append("startAt", new Date(startAt).toISOString());
    }

    if (expiresAt) {
      formData.append("expiresAt", new Date(expiresAt).toISOString());
    }

    const normalizedUrl = redirectUrl.trim()
      ? normalizeRedirectUrl(redirectUrl)
      : "";

    if (normalizedUrl) {
      formData.append("redirectUrl", normalizedUrl);
    }
  };

  const uploadCampaign = async () => {
    if (!file) {
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
      formData.append("media", file);
      formData.append("isActive", "true");
      appendCampaignFields(formData);

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
    } catch (err) {
      console.error("Upload failed", err);
      setError(err?.response?.data?.message || "Unable to upload campaign.");
      showToast({
        title: "Upload failed",
        message: "Check the file and try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const applyActivation = async (campaignId, isActive) => {
    try {
      setSaving(true);
      setError(null);
      const { data } = await api.patch(`/api/campaigns/${campaignId}/toggle`, {
        isActive,
      });
      if (data.success) {
        showToast({
          title: isActive ? "Campaign activated" : "Campaign deactivated",
          type: "success",
        });
        setActiveCampaignId(isActive ? campaignId : null);
        loadCampaigns();
      }
    } catch (err) {
      console.error("Unable to update status", err);
      setError("Unable to update campaign status");
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
      setError(null);
      const { data } = await api.delete(`/api/campaigns/${campaignId}`);
      if (data.success) {
        showToast({ title: "Campaign deleted", type: "success" });
        setCampaigns((prev) =>
          prev.filter((campaign) => campaign._id !== campaignId),
        );
        if (campaignId === activeCampaignId) {
          setActiveCampaignId(null);
        }
      }
    } catch (err) {
      console.error("Unable to delete campaign", err);
      setError("Unable to delete campaign");
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
      setError(null);
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
      setError("Unable to replace campaign.");
      showToast({
        title: "Replace failed",
        message: "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const campaignCountLabel = useMemo(() => {
    const total = campaigns.length;
    return `${total} campaign${total === 1 ? "" : "s"}`;
  }, [campaigns.length]);

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
                <p className="eyebrow">Upload Campaign</p>
                <h2>New campaign media</h2>
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

            <div className="field-set">
              <label className="field-label" htmlFor="campaign-start-at">
                Start Date & Time
              </label>
              <input
                id="campaign-start-at"
                type="datetime-local"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
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
                onChange={(event) => setExpiresAt(event.target.value)}
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
                onChange={(event) => setRedirectUrl(event.target.value)}
                className="select-control"
                placeholder="https://example.com"
                disabled={saving}
              />
            </div>

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

            <div className="form-actions">
              <button
                type="button"
                onClick={uploadCampaign}
                disabled={saving || !file}
                className="button button-primary"
              >
                <Plus size={16} />
                {saving ? "Uploading..." : "Upload Campaign"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="button button-secondary"
              >
                Clear
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
                  onChange={(event) => {
                    const selected = campaigns.find(
                      (campaign) => campaign._id === event.target.value,
                    );
                    setReplaceCampaign(selected || null);
                  }}
                  className="select-control"
                  disabled={saving || campaigns.length === 0}
                >
                  <option value="">Replace an existing campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.mediaType === "video" ? "Video" : "Image"} •{" "}
                      {new Date(campaign.createdAt).toLocaleString()}
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
                  onChange={(event) => setActiveOnly(event.target.checked)}
                />
                <span>Show active only</span>
              </label>
            </div>

            {loading ? (
              <div className="gallery-loading">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="campaign-card shimmer" />
                ))}
              </div>
            ) : (
              <div className="campaign-grid">
                {(activeOnly
                  ? campaigns.filter((campaign) => getCampaignState(campaign, now).isLive)
                  : campaigns
                ).map((campaign) => {
                  const campaignState = getCampaignState(campaign, now);

                  return (
                  <div key={campaign._id} className="campaign-card">
                    <div className="campaign-card__preview">
                      {campaign.mediaType === "video" ? (
                        <video
                          src={campaign.mediaUrl}
                          muted
                          loop
                          className="campaign-thumb"
                        />
                      ) : (
                        <img
                          src={campaign.mediaUrl}
                          alt="Campaign media"
                          className="campaign-thumb"
                        />
                      )}
                    </div>
                    <div className="campaign-card__body">
                      <div className="campaign-card__meta">
                        <span
                          className={`status-pill ${campaignState.className}`}
                        >
                          {campaignState.label}
                        </span>
                        <span className="campaign-type">
                          {campaign.mediaType === "video" ? "Video" : "Image"}
                        </span>
                      </div>
                      <p className="campaign-timestamp">
                        {new Date(campaign.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="campaign-card__actions">
                      <button
                        onClick={() =>
                          applyActivation(campaign._id, !campaign.isActive)
                        }
                        disabled={saving}
                        className={`button button-sm ${campaign.isActive ? "button-secondary" : "button-primary"}`}
                      >
                        {campaign.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          setReplaceCampaign(campaign);
                          setError(null);
                        }}
                        disabled={saving}
                        className="button button-secondary"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => removeCampaign(campaign._id)}
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
