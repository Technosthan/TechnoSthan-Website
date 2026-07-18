import "./CompanyStory.css";

const CompanyStory = () => {
  return (
    <section className="company-story">
      <div className="about-container">
        <div className="story-content">
          <div>
            <span className="section-badge">Our Story</span>
            <h2>From delivery partner to enterprise technology partner</h2>
            <p>
              Technosthan partners with organizations that need dependable
              software delivery, modern cloud architecture, and a practical
              roadmap for digital transformation.
            </p>
            <p>
              We help teams replace fragmented systems with resilient
              platforms, aligned stakeholders, and measurable business
              outcomes.
            </p>
          </div>
          <div className="story-card">
            <h3>50+</h3>
            <p>Enterprise engagements delivered</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStory;
