import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";
import MediaPicker from "../../../shared/components/MediaPicker";
import { normalizeMediaUrl } from "../../../shared/utils/media";

const emptyHero = {
  title: "",
  subtitle: "",
  badgeText: "",
  primaryCtaText: "Explore Programs",
  secondaryCtaText: "Enroll Now",
  backgroundVideoUrl: "",
  backgroundImageUrl: "",
  isActive: true,
};

const AdminHero = () => {
  const [hero, setHero] = useState(emptyHero);
  const [heroId, setHeroId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadHero = async () => {
    try {
      const response = await apiClient.get("/hero");
      if (response.hero) {
        setHero({
          ...emptyHero,
          ...response.hero,
          backgroundVideoUrl: response.hero.backgroundVideoUrl || response.hero.backgroundVideo || "",
          backgroundImageUrl: response.hero.backgroundImageUrl || response.hero.backgroundImage || "",
        });
        setHeroId(response.hero.id);
      }
    } catch (_error) {
      setHero(emptyHero);
    }
  };

  useEffect(() => {
    loadHero();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setHero((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...hero,
        backgroundVideoUrl: normalizeMediaUrl(hero.backgroundVideoUrl, "video"),
        backgroundImageUrl: normalizeMediaUrl(hero.backgroundImageUrl, "image"),
      };

      if (heroId) {
        await apiClient.put(`/admin/hero/${heroId}`, payload);
        setMessage("Hero content updated.");
      } else {
        const response = await apiClient.post("/admin/hero", payload);
        setHeroId(response.hero.id);
        setMessage("Hero content created.");
      }

      await loadHero();
    } catch (error) {
      setMessage(error.message || "Unable to save hero content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Hero content</h1>
      </div>
      <form className="card glass form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>Title</span>
          <textarea className="textarea" name="title" value={hero.title || ""} onChange={handleChange} />
        </label>
        <label className="field">
          <span>Subtitle</span>
          <textarea className="textarea" name="subtitle" value={hero.subtitle || ""} onChange={handleChange} />
        </label>
        <label className="field">
          <span>Badge text</span>
          <input className="input" name="badgeText" value={hero.badgeText || ""} onChange={handleChange} />
        </label>
        <label className="field">
          <span>Primary CTA</span>
          <input className="input" name="primaryCtaText" value={hero.primaryCtaText || ""} onChange={handleChange} />
        </label>
        <label className="field">
          <span>Secondary CTA</span>
          <input className="input" name="secondaryCtaText" value={hero.secondaryCtaText || ""} onChange={handleChange} />
        </label>

        <MediaPicker
          type="video"
          label="Background video"
          value={hero.backgroundVideoUrl || ""}
          onChange={(value) => setHero((prev) => ({ ...prev, backgroundVideoUrl: value }))}
          onRemove={() => setHero((prev) => ({ ...prev, backgroundVideoUrl: "" }))}
          helperText="Upload a video or paste a Google Drive / direct video URL."
        />

        <MediaPicker
          type="image"
          label="Background image"
          value={hero.backgroundImageUrl || ""}
          onChange={(value) => setHero((prev) => ({ ...prev, backgroundImageUrl: value }))}
          onRemove={() => setHero((prev) => ({ ...prev, backgroundImageUrl: "" }))}
          helperText="Used when no background video is available."
        />

        <label className="field checkbox-row">
          <input type="checkbox" name="isActive" checked={Boolean(hero.isActive)} onChange={handleChange} />
          Active
        </label>

        {message ? <p className="form-success">{message}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save hero"}
        </button>
      </form>
    </div>
  );
};

export default AdminHero;
