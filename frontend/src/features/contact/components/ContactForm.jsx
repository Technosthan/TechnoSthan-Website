import { useState, useEffect } from "react";
import "./ContactForm.css";

import { createContact } from "../../../api/contact.api";
import { getServices } from "../../../api/services.api";
import toast from "react-hot-toast";

const ContactForm = () => {
const [loading, setLoading] = useState(false);

const [formData, setFormData] = useState({
name: "",
email: "",
phone: "",
company: "",
subject: "",
message: "",
service: "",
});

const [services, setServices] = useState([]);

useEffect(() => {
const fetchServices = async () => {
try {
const response = await getServices();
setServices(response.data.data);
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
  await createContact(formData);

  toast.success("✅ Message Sent Successfully! Our team will contact you shortly.");

  setFormData({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    subject: "",
    message: "",
  });
} catch (error) {
  console.error(error);

  toast.error("❌ Failed to send message. Please try again.");
} finally {
  setLoading(false);
}


};

return ( <section className="contact-form-section"> <div className="about-container"> <h2>Send Us A Message</h2>


    <form
      className="contact-form"
      onSubmit={handleSubmit}
    >
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

      <select
        name="service"
        value={formData.service}
        onChange={handleChange}
      >
        <option value="">
          Select Service
        </option>

        {services.map((service) => (
          <option
            key={service.id}
            value={service.title}
          >
            {service.title}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="subject"
        placeholder="Subject"
        value={formData.subject}
        onChange={handleChange}
      />

      <textarea
        rows="6"
        name="message"
        placeholder="Tell us about your project..."
        value={formData.message}
        onChange={handleChange}
      />

      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
      >
        {loading
          ? "Sending..."
          : "Send Inquiry"}
      </button>
    </form>
  </div>
</section>


);
};

export default ContactForm;
