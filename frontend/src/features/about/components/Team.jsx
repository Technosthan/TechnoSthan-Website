import "./Team.css";
const TeamPreview = () => {
  return (
    <section className="team-preview">

      <div className="about-container">

        <h2>Leadership Team</h2>

        <div className="team-grid">

          <div className="glass-card">
            <h3>Founder</h3>
            <p>Technology Strategy</p>
          </div>

          <div className="glass-card">
            <h3>Lead Developer</h3>
            <p>Software Engineering</p>
          </div>

          <div className="glass-card">
            <h3>Cloud Architect</h3>
            <p>AWS Infrastructure</p>
          </div>

        </div>

      </div>

    </section>
  );
};

export default TeamPreview;