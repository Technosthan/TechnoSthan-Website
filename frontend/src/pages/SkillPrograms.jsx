import SectionHeader from "../components/SectionHeader";
import { programs } from "../data/siteData";

const SkillPrograms = () => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Skill Programs"
          title="Technical skill development for learners and professionals"
          description="Our programs are crafted to make graduates, students, and working professionals industry-ready and future-ready."
        />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {programs.map((program) => (
            <div key={program} className="card glass">
              <h3>{program}</h3>
              <p style={{ color: "#9aa9c2", lineHeight: 1.7 }}>
                Skill-building pathways led by experts with practical, hands-on
                learning methodologies.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillPrograms;
