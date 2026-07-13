import { useEffect, useMemo, useState } from "react";
import { Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import MediaUploader from "../../../shared/components/MediaUploader";
import { campaignService } from "../../campaigns/services/campaignService";
import {
  getMediaUrl,
  normalizeStoredMediaUrl,
} from "../../../shared/utils/media";
import { confirmAdminDelete } from "../../../shared/utils/confirm";

const emptyCampaign = {
  title: "",
  mediaUrl: "",
  mediaType: "IMAGE",
  ctaLink: "/contact",
  buttonText: "",
  redirectUrl: "",
  buttonText2: "",
  redirectUrl2: "",
  startDate: "",
  endDate: "",
  isActive: true,
  displayPages: "ALL",
  frequency: "SESSION",
  popupSize: "MEDIUM",
  priority: 0,
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "No date";

const getStatus = (campaign) => {
  if (!campaign.isActive) return "Inactive";
  const now = new Date();
  const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
  const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
  if (startDate && startDate > now) return "Scheduled";
  if (endDate && endDate < now) return "Expired";
  return "Active";
};

const AdminCampaigns = () => {
  const [form, setForm] = useState(emptyCampaign);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await campaignService.getAll();
      setCampaigns(response.campaigns || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedCampaign = useMemo(
    () => campaigns.find((item) => item.id === selectedId) || null,
    [campaigns, selectedId],
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyCampaign);
    setSelectedId(null);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      mediaUrl: normalizeStoredMediaUrl(
        form.mediaUrl,
        form.mediaType === "VIDEO" ? "video" : "image",
      ),
      priority: Number(form.priority || 0),
    };

    try {
      if (selectedId) {
        await campaignService.update(selectedId, payload);
        setMessage("Campaign updated.");
      } else {
        await campaignService.create(payload);
        setMessage("Campaign created.");
      }

      resetForm();
      await load();
    } catch (error) {
      setMessage(error.message || "Unable to save campaign.");
    }
  };

  const editCampaign = (campaign) => {
    setSelectedId(campaign.id);
    setForm({
      title: campaign.title || "",
      mediaUrl: normalizeStoredMediaUrl(
        campaign.mediaUrl || "",
        campaign.mediaType || "IMAGE",
      ),
      mediaType: campaign.mediaType || "IMAGE",
      ctaLink: campaign.ctaLink || "/contact",
      buttonText: campaign.buttonText || "",
      redirectUrl: campaign.redirectUrl || "",
      buttonText2: campaign.buttonText2 || "",
      redirectUrl2: campaign.redirectUrl2 || "",
      startDate: campaign.startDate
        ? String(campaign.startDate).slice(0, 10)
        : "",
      endDate: campaign.endDate ? String(campaign.endDate).slice(0, 10) : "",
      isActive: Boolean(campaign.isActive),
      displayPages: campaign.displayPages || "ALL",
      frequency: campaign.frequency || "SESSION",
      popupSize: campaign.popupSize || "MEDIUM",
      priority: campaign.priority ?? 0,
    });
  };

  const toggleActive = async (campaign) => {
    await campaignService[campaign.isActive ? "deactivate" : "activate"](
      campaign.id,
    );
    await load();
  };

  const remove = async (campaign) => {
    const confirmed = confirmAdminDelete(
      `the campaign "${campaign.title || "untitled"}"`,
    );
    if (!confirmed) {
      return;
    }

    await campaignService.remove(campaign.id);
    await load();
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Campaign Manager</h1>
          <p className="muted-copy">
            Create, schedule, and manage public campaigns without leaving the
            dashboard.
          </p>
        </div>
        {selectedId ? (
          <span className="badge">Editing</span>
        ) : (
          <span className="badge">Create Campaign</span>
        )}
      </div>

      <div className="admin-two-col">
        <form
          className="card glass form-grid campaign-form-card"
          onSubmit={handleSubmit}
        >
          <div className="section-heading">
            <h2>{selectedId ? "Edit Campaign" : "Create Campaign"}</h2>
            <p>
              Use Cloudinary media, page targeting, and schedule controls for
              every campaign.
            </p>
          </div>

          <div className="cards-grid-2">
            <label className="field">
              <span>Campaign title</span>
              <input
                className="input"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field">
              <span>CTA link</span>
              <input
                className="input"
                name="ctaLink"
                value={form.ctaLink}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span>Button text</span>
              <input
                className="input"
                name="buttonText"
                value={form.buttonText}
                onChange={handleChange}
                placeholder="Example: Register Now"
              />
            </label>
            <label className="field">
              <span>Redirect URL</span>
              <input
                className="input"
                name="redirectUrl"
                value={form.redirectUrl}
                onChange={handleChange}
                placeholder="Example: /contact or https://example.com/register"
              />
            </label>
            <label className="field">
              <span>Button text 2</span>
              <input
                className="input"
                name="buttonText2"
                value={form.buttonText2}
                onChange={handleChange}
                placeholder="Example: Learn More"
              />
            </label>
            <label className="field">
              <span>Redirect URL 2</span>
              <input
                className="input"
                name="redirectUrl2"
                value={form.redirectUrl2}
                onChange={handleChange}
                placeholder="Example: /programs or https://example.com/learn"
              />
            </label>
            <label className="field">
              <span>Start date</span>
              <input
                className="input"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span>End date</span>
              <input
                className="input"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span>Display pages</span>
              <select
                className="select"
                name="displayPages"
                value={form.displayPages}
                onChange={handleChange}
              >
                <option value="ALL">All pages</option>
                <option value="HOME">Home only</option>
                <option value="PROGRAMS">Programs only</option>
                <option value="CONTACT">Contact only</option>
              </select>
            </label>
            <label className="field">
              <span>Frequency</span>
              <select
                className="select"
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
              >
                <option value="SESSION">Once per session</option>
                <option value="VISIT">Every visit</option>
                <option value="DAY">Once per day</option>
              </select>
            </label>
            <label className="field">
              <span>Popup size</span>
              <select
                className="select"
                name="popupSize"
                value={form.popupSize}
                onChange={handleChange}
              >
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
                <option value="FULLSCREEN">Fullscreen</option>
              </select>
            </label>
            <label className="field">
              <span>Priority</span>
              <input
                className="input"
                name="priority"
                type="number"
                value={form.priority}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className="field">
            <span>Media type</span>
            <select
              className="select"
              name="mediaType"
              value={form.mediaType}
              onChange={handleChange}
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </label>

          <MediaUploader
            type={form.mediaType === "VIDEO" ? "video" : "image"}
            label="Campaign media"
            value={form.mediaUrl}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, mediaUrl: value }))
            }
            onRemove={() => setForm((prev) => ({ ...prev, mediaUrl: "" }))}
            helperText="Upload a file, paste a URL, or use a Google Drive link."
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Active
          </label>

          {message ? <p className="form-success">{message}</p> : null}

          <div className="table-actions">
            <button className="btn btn-primary" type="submit">
              {selectedId ? "Update campaign" : "Create campaign"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>

        <section className="card glass campaign-library">
          <div className="section-heading">
            <h2>Campaign Library</h2>
            <p>
              {loading
                ? "Loading campaigns..."
                : `${campaigns.length} campaigns available`}
            </p>
          </div>

          <div className="campaign-library-grid">
            {campaigns.map((campaign) => {
              const status = getStatus(campaign);
              const isVideo =
                String(campaign.mediaType || "").toUpperCase() === "VIDEO";
              return (
                <article key={campaign.id} className="campaign-card">
                  <div className="campaign-card-media">
                    {campaign.mediaUrl ? (
                      isVideo ? (
                        <video
                          className="campaign-card-media-el"
                          controls
                          muted
                          playsInline
                        >
                          <source
                            src={getMediaUrl(campaign.mediaUrl, "video")}
                          />
                        </video>
                      ) : (
                        <img
                          className="campaign-card-media-el"
                          src={getMediaUrl(campaign.mediaUrl, "image")}
                          alt={campaign.title}
                        />
                      )
                    ) : (
                      <div className="campaign-card-empty">No media</div>
                    )}
                  </div>

                  <div className="campaign-card-head">
                    <div>
                      <h3>{campaign.title}</h3>
                      <p className="muted-copy">
                        {campaign.ctaLink || "No CTA link"}
                      </p>
                      {campaign.buttonText && campaign.redirectUrl && (
                        <p
                          className="muted-copy"
                          style={{ fontSize: "0.85em", marginTop: "0.25rem" }}
                        >
                          Button: "{campaign.buttonText}" →{" "}
                          {campaign.redirectUrl}
                        </p>
                      )}
                      {campaign.buttonText2 && campaign.redirectUrl2 && (
                        <p
                          className="muted-copy"
                          style={{ fontSize: "0.85em", marginTop: "0.25rem" }}
                        >
                          Button 2: "{campaign.buttonText2}" →{" "}
                          {campaign.redirectUrl2}
                        </p>
                      )}
                    </div>
                    <span
                      className={`status-pill status-${status.toLowerCase()}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="campaign-card-meta">
                    <span className="meta-pill">{campaign.mediaType}</span>
                    <span className="meta-pill">{campaign.displayPages}</span>
                    <span className="meta-pill">
                      {formatDate(campaign.startDate)} -{" "}
                      {formatDate(campaign.endDate)}
                    </span>
                    <span className="meta-pill">
                      Priority {campaign.priority ?? 0}
                    </span>
                  </div>

                  <div className="table-actions campaign-card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => editCampaign(campaign)}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => toggleActive(campaign)}
                    >
                      {campaign.isActive ? (
                        <PowerOff size={14} />
                      ) : (
                        <Power size={14} />
                      )}
                      {campaign.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => remove(campaign)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {selectedCampaign ? (
            <p className="muted-copy">Editing: {selectedCampaign.title}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default AdminCampaigns;
