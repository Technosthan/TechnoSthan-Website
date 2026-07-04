import { motion } from "framer-motion";
import { ArrowRight, Cpu, Microscope, Rocket, Sparkles } from "lucide-react";

const floatingCards = [
  { title: "R&D", icon: <Microscope size={18} /> },
  { title: "Innovation", icon: <Sparkles size={18} /> },
  { title: "Skill Development", icon: <Cpu size={18} /> },
  { title: "Startup Support", icon: <Rocket size={18} /> },
];

const Hero = () => {
  return (
    <section className="section">
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="badge">
            Research • Development • Innovation • Technical Skill Excellence
          </p>
          <h1
            style={{
              fontSize: "clamp(2.3rem, 4.5vw, 4.3rem)",
              lineHeight: 1.1,
              margin: "1rem 0",
            }}
          >
            <span className="gradient-text">TechnoSthan Innovation Hub</span>
          </h1>
          <p
            style={{
              color: "#9aa9c2",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              maxWidth: "680px",
            }}
          >
            Empowering students, engineers, researchers, startups, industries,
            and future innovators through practical training, advanced research,
            product development, and real-world technology innovation.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: "1.6rem",
            }}
          >
            <a href="/rd-services" className="btn btn-primary">
              Explore Programs <ArrowRight size={18} />
            </a>
            <a href="/contact" className="btn btn-secondary">
              Contact Us
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass card"
          style={{
            minHeight: "440px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 30% 30%, rgba(94,231,255,0.18), transparent 35%), radial-gradient(circle at 70% 20%, rgba(141,91,255,0.2), transparent 20%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1, padding: "1rem" }}>
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "1.4rem",
                padding: "1rem",
                minHeight: "320px",
                background: "rgba(3,7,18,0.55)",
              }}
            >
              <div style={{ display: "grid", gap: "0.8rem" }}>
                {floatingCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="glass"
                    style={{
                      borderRadius: "999px",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.7rem",
                      width: index % 2 === 0 ? "78%" : "92%",
                    }}
                  >
                    <div className="gradient-text">{card.icon}</div>
                    <span>{card.title}</span>
                  </motion.div>
                ))}
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(94,231,255,0.2)",
                  background: "rgba(94,231,255,0.07)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#b7c5dc",
                  }}
                >
                  <span>Innovation Lab</span>
                  <span>24/7 Research</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
