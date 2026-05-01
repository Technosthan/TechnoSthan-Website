import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Briefcase,
  Layers,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Rocket
} from "lucide-react";
import "./ConsultingPage.css";

const ConsultingPage = () => {

  // 🔥 DYNAMIC SERVICES (easy to edit later)
  const services = [
    {
      icon: <Briefcase size={28} />,
      title: "IT Strategy Consulting",
      desc: "Align technology with your business goals and growth."
    },
    {
      icon: <Layers size={28} />,
      title: "Architecture Design",
      desc: "Design scalable and secure system architectures."
    },
    {
      icon: <Cpu size={28} />,
      title: "Digital Transformation",
      desc: "Upgrade legacy systems with modern technologies."
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Security Consulting",
      desc: "Risk assessment, audits, and cybersecurity planning."
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Business Optimization",
      desc: "Improve performance and operational efficiency."
    }
  ];

  return (
    <div className="consult-wrapper">

      {/* SEO */}
      <Helmet>
        <title>IT Consulting | TechnoSthan</title>
        <meta
          name="description"
          content="Expert IT consulting services including strategy, architecture, digital transformation and business optimization."
        />
      </Helmet>

      {/* HERO */}
      <section className="consult-hero">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          IT Consulting & Strategy
        </motion.h1>

        <p>
          We provide expert guidance to help businesses adopt the right technology, 
          improve systems, and scale efficiently.
        </p>
      </section>

      {/* SERVICES */}
      <section className="consult-services">
        {services.map((item, index) => (
          <motion.div
            key={index}
            className="consult-card"
            whileHover={{ y: -10 }}
          >
            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* PROCESS */}
      <section className="consult-process">
        <h2>Our Consulting Approach</h2>

        <div className="process-grid">
          <div>1. Analysis</div>
          <div>2. Planning</div>
          <div>3. Strategy</div>
          <div>4. Implementation</div>
          <div>5. Optimization</div>
        </div>
      </section>

      {/* CTA */}
      <section className="consult-cta">
        <Rocket size={30} />
        <h2>Need Expert Guidance?</h2>
        <p>Let’s build the right strategy for your business.</p>
        <button>Get Started</button>
      </section>

    </div>
  );
};

export default ConsultingPage;