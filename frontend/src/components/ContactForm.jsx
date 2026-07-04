import { useState } from "react";
import { api } from "../services/api";

const initialState = {
  fullName: "",
  email: "",
  phone: "",
  category: "Student",
  interestedArea: "",
  message: "",
};

const ContactForm = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.createEnquiry(form);
      setFeedback({
        type: "success",
        message: "Your enquiry was submitted successfully.",
      });
      setForm(initialState);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card glass"
      style={{ display: "grid", gap: "1rem" }}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <input
          className="input"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <input
          className="input"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <input
          className="input"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
        />
        <select
          className="select"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option>Student</option>
          <option>Professional</option>
          <option>Startup</option>
          <option>Industry</option>
          <option>Institution</option>
          <option>Other</option>
        </select>
      </div>
      <input
        className="input"
        name="interestedArea"
        value={form.interestedArea}
        onChange={handleChange}
        placeholder="Interested Area"
        required
      />
      <textarea
        className="textarea"
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Message"
        rows="5"
        required
      />
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Enquiry"}
      </button>
      {feedback.message && (
        <p
          style={{
            color: feedback.type === "success" ? "#4ade80" : "#f87171",
            margin: 0,
          }}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
