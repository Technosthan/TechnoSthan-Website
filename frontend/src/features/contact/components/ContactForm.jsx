import { useState } from "react";
import { submitContactForm } from "../services/contactService";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";

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
      await submitContactForm(form);
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
        <Input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />
        <Input
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
        <Input
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
      <Input
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
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Enquiry"}
      </Button>
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
