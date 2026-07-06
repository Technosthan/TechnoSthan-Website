import { useEffect, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import SectionHeader from "../../../shared/components/SectionHeader";
import ProgramCard from "../components/ProgramCard";
import { apiClient } from "../../../shared/services/apiClient";

const SkillPrograms = () => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await apiClient.get("/programs");
        setPrograms(response.programs || []);
      } catch (_error) {
        setPrograms([]);
      }
    };

    loadPrograms();
  }, []);

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Skill Programs"
          title="Technical skill development for learners and professionals"
          description="Our programs are crafted to make graduates, students, and working professionals industry-ready and future-ready."
        />
        <div className="page-hero-card glass">
          <div>
            <p className="badge">Programs & Workshops</p>
            <h3>
              Hands-on learning paths for students, graduates, and
              professionals.
            </h3>
            <p>
              Every track blends practical labs, mentorship, and portfolio-ready
              outcomes.
            </p>
          </div>
          <div className="page-pill-stack">
            <span className="page-pill">
              <BookOpen size={14} /> Live Projects
            </span>
            <span className="page-pill">
              <Sparkles size={14} /> Expert Mentors
            </span>
            <span className="page-pill">
              <Sparkles size={14} /> Placement Support
            </span>
          </div>
        </div>
        {programs.length ? (
          <div className="grid cards-grid-3">
            {programs.map((program) => (
              <ProgramCard key={program.id || program.title} program={program} />
            ))}
          </div>
        ) : (
          <div className="card glass empty-state">No programs available.</div>
        )}
      </div>
    </section>
  );
};

export default SkillPrograms;
