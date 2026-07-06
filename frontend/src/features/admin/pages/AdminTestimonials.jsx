import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const emptyTestimonial = {
  studentName: "",
  courseName: "",
  imageUrl: "",
  rating: 5,
  review: "",
  isActive: true,
};

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState(emptyTestimonial);

  const load = async () => {
    const response = await apiClient.get("/admin/testimonials");
    setTestimonials(response.testimonials || []);
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
    await apiClient.post("/admin/testimonials", {
      ...form,
      rating: Number(form.rating || 5),
    });
    setForm(emptyTestimonial);
    load();
  };

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>Testimonials</h1></div>

      <form className="card glass form-grid" onSubmit={handleSubmit}>
        <div className="cards-grid-2">
          <label className="field"><span>Student name</span><input className="input" name="studentName" value={form.studentName} onChange={handleChange} /></label>
          <label className="field"><span>Course name</span><input className="input" name="courseName" value={form.courseName} onChange={handleChange} /></label>
          <label className="field"><span>Image URL</span><input className="input" name="imageUrl" value={form.imageUrl} onChange={handleChange} /></label>
          <label className="field"><span>Rating</span><input className="input" name="rating" type="number" min="1" max="5" value={form.rating} onChange={handleChange} /></label>
        </div>
        <label className="field"><span>Review</span><textarea className="textarea" name="review" value={form.review} onChange={handleChange} /></label>
        <label className="checkbox-row"><input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active</label>
        <button className="btn btn-primary" type="submit">Save testimonial</button>
      </form>

      <div className="grid cards-grid-2">
        {testimonials.map((testimonial) => (
          <article key={testimonial.id} className="card glass">
            <p className="badge">{testimonial.courseName}</p>
            <h3>{testimonial.studentName}</h3>
            <p className="muted-copy">{testimonial.review}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;
