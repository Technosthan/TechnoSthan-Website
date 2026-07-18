import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createContact } from "../../../api/contact.api";
import { getServices } from "../../../api/services.api";
import "./ContactForm.css";

const enterpriseOptions = {
  budget: ["< $25k", "$25k - $50k", "$50k - $100k", "$100k+"],
  timeline: ["ASAP", "1-2 months", "3-6 months", "6+ months"],
  businessType: ["Enterprise", "Mid-market", "Startup", "Public Sector"],
  country: ["India", "United States", "UAE", "Other"],
};

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    subject: "",
    message: "",
    budget: "",
    timeline: "",
    businessType: "",
    country: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        setServices(response.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const enterpriseSummary = useMemo(() => {
    const parts = [
      formData.businessType && `Business type: ${formData.businessType}`,
      formData.budget && `Budget: ${formData.budget}`,
      formData.timeline && `Timeline: ${formData.timeline}`,
      formData.country && `Country: ${formData.country}`,
    ].filter(Boolean);

    return parts.join(" | ");
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Message is required");
      return;
    }

    setLoading(true);

    try {
      await createContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        service: formData.service,
        subject: formData.subject || enterpriseSummary,
        message:
          `${enterpriseSummary ? `${enterpriseSummary}\n\n` : ""}${formData.message}`.trim(),
      });

      toast.success("Message sent successfully. Our team will respond shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: "",
        subject: "",
        message: "",
        budget: "",
        timeline: "",
        businessType: "",
        country: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-form-section">
      <div className="about-container">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Business Inquiry
          </span>
          <h2>Tell us about the engagement</h2>
          <p>
            This form helps us understand your timeline, scale, and delivery
            needs before the first conversation.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
          />

          <select name="service" value={formData.service} onChange={handleChange}>
            <option value="">Service Interested In</option>
            {services.map((service) => (
              <option key={service.id} value={service.title}>
                {service.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="subject"
            placeholder="Subject / Project Title"
            value={formData.subject}
            onChange={handleChange}
          />

          <select name="businessType" value={formData.businessType} onChange={handleChange}>
            <option value="">Business Type</option>
            {enterpriseOptions.businessType.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select name="budget" value={formData.budget} onChange={handleChange}>
            <option value="">Project Budget</option>
            {enterpriseOptions.budget.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select name="timeline" value={formData.timeline} onChange={handleChange}>
            <option value="">Timeline</option>
            {enterpriseOptions.timeline.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select name="country" value={formData.country} onChange={handleChange}>
            <option value="">Country</option>
            {enterpriseOptions.country.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <textarea
            rows="6"
            name="message"
            placeholder="Tell us about the business challenge, the current stack, and the outcome you need."
            value={formData.message}
            onChange={handleChange}
          />

          <button type="submit" className="btn-primary contact-submit" disabled={loading}>
            {loading ? "Sending..." : "Request Proposal"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
