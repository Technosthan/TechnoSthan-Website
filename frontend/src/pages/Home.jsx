import { motion } from "framer-motion";
import Hero from "../components/Hero";
import SectionHeader from "../components/SectionHeader";
import FeatureCard from "../components/FeatureCard";
import {
  pillars,
  centres,
  rdServices,
  programs,
  startupSupportItems,
  industries,
  audiences,
  whyChooseUs,
} from "../data/siteData";
import {
  BrainCircuit,
  Cpu,
  GraduationCap,
  Microscope,
  Rocket,
  ShieldCheck,
} from "lucide-react";

const Home = () => {
  return (
    <>
      <Hero />
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="About"
            title="TechnoSthan Innovation Hub"
            description="A dedicated Research & Development and Technical Skill Development vertical focused on innovation, entrepreneurship, product engineering, and industry-ready talent."
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: "1.4rem",
              alignItems: "start",
            }}
          >
            <div className="card glass">
              <p style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
                TechnoSthan Innovation Hub is the Research & Development and
                Technical Skill Development division of TechnoSthan, dedicated
                to nurturing innovators, engineers, researchers, developers,
                entrepreneurs, startups, and future technology leaders. Our
                mission is to bridge the gap between academic learning and
                real-world industry requirements through practical training,
                research opportunities, innovation support, product development,
                startup incubation, and industry collaboration.
              </p>
            </div>
            <div className="card glass">
              <h3 className="gradient-text" style={{ marginTop: 0 }}>
                Vision
              </h3>
              <p style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
                To become a globally recognized centre of excellence in
                research, innovation, advanced technologies, and technical skill
                development, contributing towards sustainable development and
                building an innovation-driven India.
              </p>
              <h3 className="gradient-text" style={{ marginTop: "1.2rem" }}>
                Mission
              </h3>
              <p style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
                Create modern skill and research ecosystems that promote
                innovation, entrepreneurship, industry collaboration, and
                technology commercialization.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Our Pillars"
            title="The foundation of our innovation ecosystem"
            description="A comprehensive platform that brings together research, technology, learning, and entrepreneurship under one roof."
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="card glass"
              >
                <h3>{pillar}</h3>
                <p style={{ color: "#9aa9c2", marginBottom: 0 }}>
                  Building the next wave of disruptive technology and
                  development capability.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Centres of Excellence"
            title="Domains where we build future-ready capability"
            description="Advanced specializations across emerging technologies and innovation-led industry solutions."
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
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Core Services"
            title="What we offer"
            description="Integrated support for research, innovation, training, and entrepreneurship."
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            }}
          >
            <FeatureCard
              title="R&D Services"
              description="Applied research, prototyping, and product development support for startups and industries."
              icon={<Microscope />}
            />
            <FeatureCard
              title="Skill Programs"
              description="Training programs and workshops aligned to industry requirements and future-ready skills."
              icon={<GraduationCap />}
            />
            <FeatureCard
              title="Startup Support"
              description="Incubation, mentorship, product development, and investor readiness support."
              icon={<Rocket />}
            />
            <FeatureCard
              title="Industry Partnerships"
              description="Collaborative innovation, technical consulting, and implementation support across sectors."
              icon={<ShieldCheck />}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Programs & Services"
            title="From labs to careers"
            description="A complete pipeline that supports innovation, development, and employability."
          />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="card glass">
              <h3>R&D Services</h3>
              <ul style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
                {rdServices.slice(0, 10).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card glass">
              <h3>Skill Programs</h3>
              <ul style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
                {programs.slice(0, 10).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Who Can Join"
            title="Open to learners, creators, builders, and organizations"
            description="From students to industry teams, we create pathways for innovation-driven growth."
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            {audiences.map((audience) => (
              <div
                key={audience}
                className="card glass"
                style={{ textAlign: "center" }}
              >
                {audience}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Why Choose Us"
            title="Built for the future of innovation"
            description="An ecosystem where research meets real-world impact."
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {whyChooseUs.map((item) => (
              <div
                key={item}
                className="card glass"
                style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
              >
                <ShieldCheck className="gradient-text" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
