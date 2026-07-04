import SectionHeader from "../../../shared/components/SectionHeader";
import IndustryCard from "../components/IndustryCard";
import { industriesData } from "../data/industriesData";

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
          {industriesData.map((industry) => (
            <IndustryCard key={industry} industry={industry} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;
