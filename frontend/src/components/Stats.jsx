const DEFAULT_STATS = [
  { value: "500+", label: "Projects Delivered" },
  { value: "150+", label: "Active Clients" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "24/7", label: "Support" },
];

export default function StatsSection({ stats = DEFAULT_STATS }) {
  return (
    <section className="stats-section section-pad">
      <div className="container">
        <div className="stats-grid">
          {stats.map((item, index) => (
            <div key={`${item.label}-${index}`} className="stats-card">
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
