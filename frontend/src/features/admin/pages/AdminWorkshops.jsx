import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";
import MediaPicker from "../../../shared/components/MediaPicker";

const emptyWorkshop = {
  title: "",
  slug: "",
  description: "",
  thumbnailUrl: "",
  date: "",
  time: "",
  mode: "ONLINE",
  fees: "",
  seats: "",
  seatsLeft: "",
  isActive: true,
};

const AdminWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [form, setForm] = useState(emptyWorkshop);

  const load = async () => {
    const response = await apiClient.get("/workshops");
    setWorkshops(response.workshops || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await apiClient.post("/workshops", {
      ...form,
      fees: Number(form.fees || 0),
      seats: Number(form.seats || 0),
      seatsLeft: Number(form.seatsLeft || form.seats || 0),
    });
    setForm(emptyWorkshop);
    load();
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Workshops</h1>
      </div>

      <form className="card glass form-grid" onSubmit={handleSubmit}>
        <div className="cards-grid-2">
          <label className="field">
            <span>Title</span>
            <input className="input" name="title" value={form.title} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Slug</span>
            <input className="input" name="slug" value={form.slug} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea className="textarea" name="description" value={form.description} onChange={handleChange} />
          </label>
          <MediaPicker
            type="image"
            label="Thumbnail"
            value={form.thumbnailUrl}
            onChange={(value) => setForm((prev) => ({ ...prev, thumbnailUrl: value }))}
            onRemove={() => setForm((prev) => ({ ...prev, thumbnailUrl: "" }))}
          />
          <label className="field">
            <span>Date</span>
            <input className="input" name="date" type="date" value={form.date} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Time</span>
            <input className="input" name="time" value={form.time} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Mode</span>
            <select className="select" name="mode" value={form.mode} onChange={handleChange}>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </label>
          <label className="field">
            <span>Fees</span>
            <input className="input" name="fees" value={form.fees} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Seats</span>
            <input className="input" name="seats" value={form.seats} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Seats left</span>
            <input className="input" name="seatsLeft" value={form.seatsLeft} onChange={handleChange} />
          </label>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          Active
        </label>
        <button className="btn btn-primary" type="submit">Save workshop</button>
      </form>

      <div className="grid cards-grid-2">
        {workshops.map((workshop) => (
          <article key={workshop.id} className="card glass">
            <p className="badge">{workshop.mode}</p>
            <h3>{workshop.title}</h3>
            <p className="muted-copy">{workshop.description}</p>
            <p className="muted-copy">
              {new Date(workshop.date).toLocaleDateString("en-IN")} • Seats left: {workshop.seatsLeft}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminWorkshops;
