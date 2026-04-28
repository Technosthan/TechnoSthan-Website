import React, { useState } from "react";
import "./Contact.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Contact = () => {

  const navigate = useNavigate();

  // ✅ state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    message: ""
  });

  //handle change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  //  submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/contact", formData);
      alert("Form Submitted Successfully");

      // reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        website: "",
        location: "",
        message: ""
      });

    } catch (error) {
      console.error(error);
      alert("Something went wrong ❌");
    }
  };

  return (
    <section className="contact">

      <div className="contact-header">
        <h1>Get In Touch</h1>
        <p>We’d love to hear from you. Fill out the form and our team will contact you soon.</p>
      </div>

      <div className="contact-wrapper">

        {/* FORM */}
        <form className="contact-form" onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="contact-name">Name</label>
            <input 
              id="contact-name"
              type="text" 
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="contact-email">Email</label>
              <input 
                id="contact-email"
                type="email" 
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="contact-phone">Phone</label>
              <input 
                id="contact-phone"
                type="tel" 
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="contact-website">Website</label>
              <input 
                id="contact-website"
                type="url" 
                name="website"
                autoComplete="url"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label htmlFor="contact-location">Location</label>
              <input 
                id="contact-location"
                type="text" 
                name="location"
                autoComplete="street-address"
                value={formData.location}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="contact-message">Message</label>
            <textarea 
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Submit Request
          </button>

        </form>

        {/* RIGHT PANEL */}
        <div className="contact-info">

          <h3>Our Location</h3>
          <p>
            New Sanganer Road, Jaipur <br />
            Rajasthan - 302019, India
          </p>

          <h3>Quick Contact</h3>
          <p>
            Email:{" "}
            <a href="mailto:info@technosthan.com">
              info@technosthan.com

            </a>
            </p>
            {/*phone */}
            
          <p>
            phone:{" "}
            <a href="tel:+919477288288">
              +91 9477-288-288

            </a>
           </p>

          <h3>Opening Hours</h3>
          <p>Monday - Saturday</p>
          <p>10:00 AM - 07:00 PM</p>

          {/* BUTTON */}
          <button 
            type="button"
            className="cta-btn"
            onClick={() => navigate("/solution")}
          >
            Find Your Solution →
          </button>

        </div>

      </div>

    </section>
  );
};

export default Contact;