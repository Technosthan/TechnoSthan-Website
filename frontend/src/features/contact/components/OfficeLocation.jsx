import "./OfficeLocation.css";

const OfficeLocation = () => {
  return (
    <section className="office-location">

      <div className="about-container">

        <h2>Our Location</h2>

        <div className="map-box">

          <iframe
            title="office-location"
            src="https://maps.google.com/maps?q=Jaipur&t=&z=13&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
          />

        </div>

      </div>

    </section>
  );
};

export default OfficeLocation;