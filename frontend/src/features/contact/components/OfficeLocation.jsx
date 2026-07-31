import { FiMapPin, FiArrowRight } from "react-icons/fi";
import "./OfficeLocation.css";
import { COMPANY_ADDRESS } from "../../../shared/constants/company-contact";

const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_ADDRESS)}`;

const OfficeLocation = () => {
  return (
    <section className="office-location" data-motion-zone="footer">
      <div className="contact-enterprise__shell office-location__layout" data-contact-reveal>
        <div className="office-location__map-box">
          <iframe
            title="office-location"
            src="https://maps.google.com/maps?q=Jaipur&t=&z=13&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
          />
        </div>

        <aside className="office-location__panel">
          <span className="section-badge">
            <span className="badge-dot" />
            Office location
          </span>
          <h2>Find TechnoSthan in Jaipur</h2>
          <p>
            The public office address is listed below. Use the map for quick navigation or open it in your preferred maps app.
          </p>

          <div className="contact-form__aside-item">
            <span className="contact-form__aside-icon" aria-hidden="true">
              <FiMapPin size={15} />
            </span>
            <div className="contact-form__aside-copy">
              <span>Address</span>
              <strong>{COMPANY_ADDRESS}</strong>
            </div>
          </div>

          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Open in Maps
            <FiArrowRight aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  );
};

export default OfficeLocation;
