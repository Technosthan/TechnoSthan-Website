import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Code2, Smartphone, ShieldCheck, Layers, Rocket } from "lucide-react";
import "./EngineeringPage.css";

const EngineeringPage = () => {

  const services = [
    {
      icon: <Code2 size={28} />,
      title: "Web Development",
      desc: "High-performance web apps using React, Node, and modern architecture."
    },
    {
      icon: <Smartphone size={28} />,
      title: "Mobile App Development",
      desc: "Cross-platform and native apps with smooth UI/UX."
    },
    {
      icon: <Layers size={28} />,
      title: "API & Backend",
      desc: "Robust backend systems, APIs, and scalable infrastructure."
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Security & Optimization",
      desc: "Secure, optimized and fast-loading applications."
    }
  ];

  return (
    <div className="eng-wrapper">

      {/* SEO */}
      <Helmet>
        <title>Engineering & Development | TechnoSthan</title>
        <meta name="description" content="TechnoSthan provides scalable web, mobile, and backend development services with modern technologies." />
      </Helmet>

      {/* HERO */}
      <section className="eng-hero">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Engineering & Development
        </motion.h1>

        <p>
          We design and build secure, scalable, and high-performance digital products 
          using modern technologies and best practices.
        </p>
      </section>

      {/* SERVICES */}
      <section className="eng-services">
        {services.map((item, index) => (
          <motion.div 
            key={index}
            className="eng-card"
            whileHover={{ y: -10 }}
          >
            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* PROCESS */}
      <section className="eng-process">
        <h2>Our Development Process</h2>

        <div className="process-grid">
          <div>1. Requirement</div>
          <div>2. Design</div>
          <div>3. Development</div>
          <div>4. Testing</div>
          <div>5. Deployment</div>
        </div>
      </section>

      {/* CTA */}
      <section className="eng-cta">
        <Rocket size={30} />
        <h2>Ready to Build Your Product?</h2>
        <p>Let’s turn your idea into a scalable solution.</p>
        <button>Get Started</button>
      </section>

    </div>
  );
};

export default EngineeringPage;