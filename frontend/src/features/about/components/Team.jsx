import "./Team.css";
const TeamPreview = () => {
  return (
    <section className="team-preview">
      <div className="about-container">
        <h2>Leadership And Delivery Capability</h2>
        <div className="team-grid">
          <div className="glass-card">
            <h3>Enterprise Strategy</h3>
            <p>Roadmaps, governance, and transformation planning</p>
          </div>
          <div className="glass-card">
            <h3>Software Engineering</h3>
            <p>Product delivery, platforms, and integrations</p>
          </div>
          <div className="glass-card">
            <h3>Cloud & Security</h3>
            <p>Infrastructure, resilience, and secure operations</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamPreview;
