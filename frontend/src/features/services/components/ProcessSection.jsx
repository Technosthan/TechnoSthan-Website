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
    <section className="process-section" data-motion-zone="process">
      <div className="about-container">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Delivery Method
          </span>
          <h2>Our enterprise delivery process</h2>
          <p>
            Structured discovery, clear milestones, and a delivery rhythm that
            keeps business stakeholders informed at every stage.
          </p>
        </div>

        <div className="process-grid">
          {process.map((step, index) => (
            <div key={step} className="glass-card process-card">
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
