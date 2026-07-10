import SectionHeader from "../components/SectionHeader";
import { startupSupportItems } from "../data/siteData";

const StartupSupport = () => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          // eyebrow="Startup Support"
          title="Support that helps ideas become impact"
          // description="We guide startups from concept to commercialization with strategic, technical, and business assistance."
        />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {startupSupportItems.map((item) => (
            <div key={item} className="card glass">
              <h3>{item}</h3>
              <p style={{ color: "#9aa9c2", lineHeight: 1.7 }}>
                Dedicated support to accelerate growth, reduce risk, and
                strengthen commercialization readiness.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StartupSupport;
