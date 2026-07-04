import SectionHeader from "../components/SectionHeader";
import { pillars, centres } from "../data/siteData";

const About = () => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="About Us"
          title="A dedicated ecosystem for research, innovation, and skill excellence"
          description="We connect technology, learning, entrepreneurship, and industry collaboration into a single premium experience."
        />
        <div
          className="grid"
          style={{ gridTemplateColumns: "1.1fr 0.9fr", gap: "1.4rem" }}
        >
          <div className="card glass">
            <p style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
              TechnoSthan Innovation Hub is our Research & Development and
              Technical Skill Development vertical, designed to become a
              catalyst for innovation-led growth. We nurture students,
              researchers, startups, institutions, and industries through
              practical learning, advanced research, product design, and
              solution development.
            </p>
          </div>
          <div className="card glass">
            <h3 className="gradient-text">Mission</h3>
            <p style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
              To promote scientific research, technology innovation, and
              industry-ready talent development by building high-impact programs
              and collaborative ecosystems.
            </p>
          </div>
        </div>

        <div className="section">
          <SectionHeader
            eyebrow="Our Pillars"
            title="Five foundations of innovation"
            description="Each pillar is designed to create impact from learning to commercialization."
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {pillars.map((pillar) => (
              <div key={pillar} className="card glass">
                <h3>{pillar}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <SectionHeader
            eyebrow="Centres of Excellence"
            title="Advanced domains we lead"
            description="We focus on technologies that define the next decade of industry and society."
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            {centres.map((centre) => (
              <div
                key={centre}
                className="card glass"
                style={{ textAlign: "center" }}
              >
                {centre}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
