import "./ProcessSection.css";

const process = [
  "Discovery",
  "Planning",
  "Design",
  "Development",
  "Testing",
  "Deployment",
];

const ProcessSection = () => {
  return (
    <section className="process-section">

      <div className="about-container">

        <h2>Our Development Process</h2>

        <div className="process-grid">

          {process.map((step, index) => (
            <div
              key={step}
              className="glass-card process-card"
            >
              <span>0{index + 1}</span>

              <h3>{step}</h3>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default ProcessSection;