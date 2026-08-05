import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/api";

const enquiryTypes = [
  "Property Enquiry",
  "Project Partnership",
  "Landowner Partnership",
  "Investment Opportunity",
  "Government or Institutional Project",
  "Vendor or Contractor Registration",
  "General Enquiry",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  enquiryType: enquiryTypes[0],
  city: "",
  location: "",
  budget: "",
  message: "",
  consent: false,
};

const EnquiryForm = ({ title = "Start your enquiry", compact = false }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/contact", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        website: form.organisation,
        location: [form.city, form.location, form.budget, form.enquiryType]
          .filter(Boolean)
          .join(" | "),
        message: `${form.message}\n\nConsent: ${form.consent ? "Yes" : "No"}`,
      });

      toast.success("Your enquiry has been submitted.");
      setForm(initialForm);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "We could not submit the enquiry. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`enquiry-form ${compact ? "enquiry-form--compact" : ""}`} onSubmit={submit}>
      <h3>{title}</h3>
      <div className="form-grid">
        <label>
          Name
          <input name="name" value={form.name} onChange={updateField} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={updateField} required />
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={updateField} required />
        </label>
        <label>
          Organisation
          <input name="organisation" value={form.organisation} onChange={updateField} />
        </label>
        <label>
          Enquiry Type
          <select name="enquiryType" value={form.enquiryType} onChange={updateField}>
            {enquiryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          City
          <input name="city" value={form.city} onChange={updateField} />
        </label>
        <label className="form-grid__full">
          Land or project location
          <input name="location" value={form.location} onChange={updateField} />
        </label>
        <label className="form-grid__full">
          Budget or project scale
          <input name="budget" value={form.budget} onChange={updateField} />
        </label>
        <label className="form-grid__full">
          Message
          <textarea name="message" rows="5" value={form.message} onChange={updateField} required />
        </label>
        <label className="form-grid__full form-consent">
          <input type="checkbox" name="consent" checked={form.consent} onChange={updateField} />
          I consent to be contacted about this enquiry.
        </label>
      </div>
      <button className="btn btn--primary" type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit enquiry"}
      </button>
    </form>
  );
};

export default EnquiryForm;

