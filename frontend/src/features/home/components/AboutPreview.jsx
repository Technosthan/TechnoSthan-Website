import { motion } from "framer-motion";
import { BadgeCheck, BriefcaseBusiness, GraduationCap } from "lucide-react";
import SectionHeader from "../../../shared/components/SectionHeader";

const highlights = [
  {
    icon: <GraduationCap size={18} />,
    title: "Live Learning",
    description: "Hands-on sessions that feel like real industry training.",
  },
  {
    icon: <BriefcaseBusiness size={18} />,
    title: "Career Ready",
    description: "Placement support, guidance, and internship pathways.",
  },
  {
    icon: <BadgeCheck size={18} />,
    title: "Certified Growth",
    description: "Mentorship, certificates, and visible project outcomes.",
  },
];

const AboutPreview = () => {
  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          eyebrow="Why Students Choose Us"
          title="A premium learning experience for builders and innovators"
          description="Every program is designed to feel practical, inspiring, and career-focused."
        />
        <div className="grid about-grid">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card glass about-highlight"
          >
            <p className="badge">Institute-led growth</p>
            <h3 className="gradient-text">Designed for ambitious learners</h3>
            <p className="muted-copy">
              TechnoSthan Innovation Hub blends technical training, product
              development, internships, workshops, and startup support into a
              single premium learner journey.
            </p>
          </motion.div>
          <div className="feature-stack">
            {highlights.map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card glass feature-card"
              >
                <div className="gradient-text feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p className="muted-copy">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
