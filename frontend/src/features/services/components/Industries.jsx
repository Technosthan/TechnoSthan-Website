import "./Industries.css";

const industries = [
  "Healthcare",
  "Agriculture",
  "E-Commerce",
  "Education",
  "Finance",
  "Real Estate",
];

const Industries = () => {
  return (
    <section className="industries-section">

      <div className="about-container">

        <h2>Industries We Serve</h2>

        <div className="industry-grid">

          {industries.map((industry) => (
            <div
              key={industry}
              className="glass-card industry-card"
            >
              {industry}
            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default Industries;