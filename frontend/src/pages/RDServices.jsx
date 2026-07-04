import SectionHeader from "../components/SectionHeader";
import { rdServices } from "../data/siteData";

const RDServices = () => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="R&D Services"
          title="Research, prototyping, and product innovation support"
          description="From ideation to deployment, we help teams move from concept to implementation with confidence."
        />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          }}
        >
          {rdServices.map((service) => (
            <div key={service} className="card glass">
              <h3>{service}</h3>
              <p style={{ color: "#9aa9c2", lineHeight: 1.7 }}>
                Specialized support for applied research, prototyping,
                development, testing, and deployment.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RDServices;
