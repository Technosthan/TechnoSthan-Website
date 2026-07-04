import SectionHeader from "../components/SectionHeader";
import { industries } from "../data/siteData";

const Industries = () => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Industries"
          title="Serving sectors that shape the future"
          description="Our solutions and programs are tailored for high-growth industries and emerging technology ecosystems."
        />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {industries.map((industry) => (
            <div key={industry} className="card glass">
              <h3>{industry}</h3>
              <p style={{ color: "#9aa9c2", lineHeight: 1.7 }}>
                Technology-driven collaboration for transformation, efficiency,
                and scalable innovation.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;
