import { useEffect, useMemo, useState } from "react";
import MediaUploader from "../../../shared/components/MediaUploader";
import { campaignService } from "../../campaigns/services/campaignService";
import { getMediaUrl, normalizeStoredMediaUrl } from "../../../shared/utils/media";
import { confirmAdminDelete } from "../../../shared/utils/confirm";

const emptyCampaign = {
  title: "",
  mediaUrl: "",
  mediaType: "IMAGE",
  ctaLink: "/contact",
  startDate: "",
  endDate: "",
  isActive: true,
  displayPages: "ALL",
  frequency: "SESSION",
  popupSize: "MEDIUM",
  priority: 0,
};

const AdminCampaigns = () => {
  const [form, setForm] = useState(emptyCampaign);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await campaignService.getAll();
    setCampaigns(response.campaigns || []);
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
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      mediaUrl: normalizeStoredMediaUrl(form.mediaUrl, form.mediaType === "VIDEO" ? "video" : "image"),
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

      setForm(emptyCampaign);
      setSelectedId(null);
      await load();
    } catch (error) {
      setMessage(error.message || "Unable to save campaign.");
    }
  };

  const editCampaign = (campaign) => {
    setSelectedId(campaign.id);
    setForm({
      title: campaign.title || "",
      mediaUrl: normalizeStoredMediaUrl(campaign.mediaUrl || "", campaign.mediaType || "IMAGE"),
      mediaType: campaign.mediaType || "IMAGE",
      ctaLink: campaign.ctaLink || "/contact",
      startDate: campaign.startDate ? String(campaign.startDate).slice(0, 10) : "",
      endDate: campaign.endDate ? String(campaign.endDate).slice(0, 10) : "",
      isActive: Boolean(campaign.isActive),
      displayPages: campaign.displayPages || "ALL",
      frequency: campaign.frequency || "SESSION",
      popupSize: campaign.popupSize || "MEDIUM",
      priority: campaign.priority ?? 0,
    });
  };

  const toggleActive = async (campaign) => {
    await campaignService[campaign.isActive ? "deactivate" : "activate"](campaign.id);
    await load();
  };

  const remove = async (campaign) => {
    const confirmed = confirmAdminDelete(`the campaign "${campaign.title || "untitled"}"`);
    if (!confirmed) {
      return;
    }

    await campaignService.remove(campaign.id);
    await load();
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Campaign Manager</h1>
      </div>

      <div className="admin-two-col">
        <form className="card glass form-grid" onSubmit={handleSubmit}>
          <div className="cards-grid-2">
            <label className="field">
              <span>Campaign title</span>
              <input className="input" name="title" value={form.title} onChange={handleChange} />
            </label>
            <label className="field">
              <span>CTA link</span>
              <input className="input" name="ctaLink" value={form.ctaLink} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Start date</span>
              <input className="input" type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            </label>
            <label className="field">
              <span>End date</span>
              <input className="input" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Display pages</span>
              <select className="select" name="displayPages" value={form.displayPages} onChange={handleChange}>
                <option value="ALL">All pages</option>
                <option value="HOME">Home only</option>
                <option value="PROGRAMS">Programs only</option>
                <option value="CONTACT">Contact only</option>
              </select>
            </label>
            <label className="field">
              <span>Frequency</span>
              <select className="select" name="frequency" value={form.frequency} onChange={handleChange}>
                <option value="SESSION">Once per session</option>
                <option value="VISIT">Every visit</option>
                <option value="DAY">Once per day</option>
              </select>
            </label>
            <label className="field">
              <span>Popup size</span>
              <select className="select" name="popupSize" value={form.popupSize} onChange={handleChange}>
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
                <option value="FULLSCREEN">Fullscreen</option>
              </select>
            </label>
            <label className="field">
              <span>Priority</span>
              <input className="input" name="priority" type="number" value={form.priority} onChange={handleChange} />
            </label>
          </div>

          <label className="field">
            <span>Media type</span>
            <select className="select" name="mediaType" value={form.mediaType} onChange={handleChange}>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </label>

          <MediaUploader
            type={form.mediaType === "VIDEO" ? "video" : "image"}
            label="Campaign media"
            value={form.mediaUrl}
            onChange={(value) => setForm((prev) => ({ ...prev, mediaUrl: value }))}
            onRemove={() => setForm((prev) => ({ ...prev, mediaUrl: "" }))}
            helperText="Upload a file, paste a URL, or use a Google Drive link."
          />

          <label className="checkbox-row">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            Active
          </label>
          {message ? <p className="form-success">{message}</p> : null}
          <div className="table-actions">
            <button className="btn btn-primary" type="submit">{selectedId ? "Update campaign" : "Create campaign"}</button>
            <button className="btn btn-secondary" type="button" onClick={() => { setForm(emptyCampaign); setSelectedId(null); }}>
              Reset
            </button>
          </div>
        </form>

        <div className="builder-stack">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="card glass campaign-card">
              {campaign.mediaUrl ? (
                campaign.mediaType === "VIDEO" ? (
                  <video className="campaign-media" controls muted playsInline>
                    <source src={getMediaUrl(campaign.mediaUrl, "video")} />
                  </video>
                ) : (
                  <img className="campaign-media" src={getMediaUrl(campaign.mediaUrl, "image")} alt={campaign.title} />
                )
              ) : null}
              <p className="badge">{campaign.isActive ? "Active" : "Inactive"}</p>
              <h3>{campaign.title}</h3>
              <p className="muted-copy">{campaign.displayPages}</p>
              <p className="muted-copy">
                {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString("en-IN") : "No start"} - {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString("en-IN") : "No end"}
              </p>
              <div className="table-actions">
                <button className="btn btn-secondary" type="button" onClick={() => toggleActive(campaign)}>
                  {campaign.isActive ? "Deactivate" : "Activate"}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => editCampaign(campaign)}>
                  Edit
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => remove(campaign)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {selectedCampaign ? <p className="muted-copy">Editing: {selectedCampaign.title}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default AdminCampaigns;
