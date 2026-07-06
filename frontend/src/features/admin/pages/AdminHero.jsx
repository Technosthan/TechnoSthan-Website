import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

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

  useEffect(() => {
    const load = async () => {
      const response = await apiClient.get("/hero");
      if (response.hero) {
        setHero(response.hero);
        setHeroId(response.hero.id);
      }
    };
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setHero((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (heroId) {
      await apiClient.put(`/admin/hero/${heroId}`, hero);
    } else {
      const response = await apiClient.post("/admin/hero", hero);
      setHeroId(response.hero.id);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>Hero content</h1></div>
      <form className="card glass form-grid" onSubmit={handleSubmit}>
        <label className="field"><span>Title</span><textarea className="textarea" name="title" value={hero.title || ""} onChange={handleChange} /></label>
        <label className="field"><span>Subtitle</span><textarea className="textarea" name="subtitle" value={hero.subtitle || ""} onChange={handleChange} /></label>
        <label className="field"><span>Badge text</span><input className="input" name="badgeText" value={hero.badgeText || ""} onChange={handleChange} /></label>
        <label className="field"><span>Primary CTA</span><input className="input" name="primaryCtaText" value={hero.primaryCtaText || ""} onChange={handleChange} /></label>
        <label className="field"><span>Secondary CTA</span><input className="input" name="secondaryCtaText" value={hero.secondaryCtaText || ""} onChange={handleChange} /></label>
        <label className="field"><span>Background video URL</span><input className="input" name="backgroundVideoUrl" value={hero.backgroundVideoUrl || ""} onChange={handleChange} /></label>
        <label className="field"><span>Background image URL</span><input className="input" name="backgroundImageUrl" value={hero.backgroundImageUrl || ""} onChange={handleChange} /></label>
        <label className="field checkbox-row"><input type="checkbox" name="isActive" checked={Boolean(hero.isActive)} onChange={handleChange} /> Active</label>
        <button className="btn btn-primary" type="submit">Save hero</button>
      </form>
    </div>
  );
};

export default AdminHero;
