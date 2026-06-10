import "./ContactForm.css";

const ContactForm = () => {
  return (
    <section className="contact-form-section">

      <div className="about-container">

        <h2>Send Us A Message</h2>

        <form className="contact-form">

          <input
            type="text"
            placeholder="Full Name"
          />

          <input
            type="email"
            placeholder="Email Address"
          />

          <input
            type="text"
            placeholder="Phone Number"
          />

          <input
            type="text"
            placeholder="Company Name"
          />

          <select>
            <option>
              Select Service
            </option>

            <option>
              Web Development
            </option>

            <option>
              Mobile App Development
            </option>

            <option>
              Cloud Solutions
            </option>

            <option>
              AI Automation
            </option>
          </select>

          <input
            type="text"
            placeholder="Project Budget"
          />

          <textarea
            rows="6"
            placeholder="Tell us about your project..."
          />

          <button
            type="submit"
            className="btn-primary"
          >
            Send Inquiry
          </button>

        </form>

      </div>

    </section>
  );
};

export default ContactForm;