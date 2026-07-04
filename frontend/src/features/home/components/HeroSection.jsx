import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import heroVideo from "@/assets/hero-bg.mp4";
import heroImage from "@/assets/hero-right.png";

const stats = [
  { value: "1000+", label: "Learners" },
  { value: "150+", label: "Projects" },
  { value: "50+", label: "Workshops" },
  { value: "30+", label: "Mentors" },
];

const HeroSection = () => {
  return (
    <section className="hero">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="hero-overlay" />
      <div className="hero-radial" />

      <div className="container hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="hero-copy-block"
        >
          <p className="badge">
            Practical Training • Internships • Live Projects • Placement Support
          </p>
          <h1>
            Learn Skills.
            <br />
            Build Products.
            <br />
            <span className="gradient-text">Get Job Ready.</span>
          </h1>
          <p className="hero-copy">
            Practical training, internships, workshops, live projects, and
            innovation support for students and professionals.
          </p>

          <div className="hero-actions">
            <a href="/skill-programs" className="btn btn-primary">
              Explore Programs <ArrowRight size={18} />
            </a>
            <a href="/contact" className="btn btn-secondary">
              <PlayCircle size={18} /> Apply Now
            </a>
          </div>

          <div className="hero-stats">
            {stats.map((item) => (
              <div key={item.label} className="hero-stat-card glass">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        
      </div>
    </section>
  );
};

export default HeroSection;
