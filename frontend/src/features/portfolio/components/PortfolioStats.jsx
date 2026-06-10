import './PortfolioStats.css';

const PortfolioStats = () => {
  return (
    <section className="portfolio-stats">

      <div className="about-container">

        <div className="stats-grid">

          <div className="glass-card">
            <h3>50+</h3>
            <p>Projects Delivered</p>
          </div>

          <div className="glass-card">
            <h3>20+</h3>
            <p>Clients Served</p>
          </div>

          <div className="glass-card">
            <h3>5+</h3>
            <p>Years Experience</p>
          </div>

          <div className="glass-card">
            <h3>99%</h3>
            <p>Client Satisfaction</p>
          </div>

        </div>

      </div>

    </section>
  );
};

export default PortfolioStats;