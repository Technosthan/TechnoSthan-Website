import "./CompanyStats.css";

const stats = [
  { number: "50+", label: "Enterprise Projects" },
  { number: "20+", label: "Business Clients" },
  { number: "5+", label: "Years of Delivery" },
  { number: "99%", label: "Client Satisfaction" },
];

const CompanyStats = () => {
  return (
    <section className="stats-section">
      <div className="about-container">

        <h2>Impact That Builds Confidence</h2>

        <div className="stats-grid">
          {stats.map((item) => (
            <div key={item.label} className="glass-card">
              <h3>{item.number}</h3>
              <p>{item.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CompanyStats;
