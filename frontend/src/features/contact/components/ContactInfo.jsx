import {
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import "./ContactInfo.css";

const items = [
  { title: "Email", value: "info@technosthan.com", icon: FiMail },
  { title: "Phone", value: "+91 9477-288-288", icon: FiPhone },
  { title: "Location", value: "Jaipur, Rajasthan", icon: FiMapPin },
  {
    title: "Working Hours",
    value: "Mon - Sat, 10:00 AM to 7:00 PM",
    icon: FiClock,
  },
];

const ContactInfo = () => {
  return (
    <section className="contact-info">
      <div className="about-container">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Contact Details
          </span>
          <h2>
            Direct access to the people who can move your project forward
          </h2>
          <p>
            For urgent enterprise enquiries, use the contact methods below and
            we&apos;ll route your message to the right team quickly.
          </p>
        </div>

        <div className="info-grid">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="glass-card info-card">
                <span className="info-card-icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3>{item.title}</h3>
                <p>{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
