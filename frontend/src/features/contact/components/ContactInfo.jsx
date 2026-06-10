import "./ContactInfo.css";

const ContactInfo = () => {
  return (
    <section className="contact-info">

      <div className="about-container">

        <div className="info-grid">

          <div className="glass-card info-card">
            <h3>📧 Email</h3>
            <p>info@technosthan.com</p>
          </div>

          <div className="glass-card info-card">
            <h3>📞 Phone</h3>
            <p>+91 9477-288-288 </p>
          </div>

          <div className="glass-card info-card">
            <h3>📍 Location</h3>
            <p>Jaipur, Rajasthan</p>
          </div>

          <div className="glass-card info-card">
            <h3>🕒 Working Hours</h3>
            <p>24/7 Available</p>
          </div>

        </div>

      </div>

    </section>
  );
};

export default ContactInfo;