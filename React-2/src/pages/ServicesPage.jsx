// import React from "react";
// import { motion } from "framer-motion";
// import { Helmet } from "react-helmet-async";
// import { Link } from "react-router-dom";
// import {
//   Code2,
//   Cloud,
//   Smartphone,
//   ShieldCheck,
//   Rocket
// } from "lucide-react";
// import "./TechnoSthanITServices.css";

// const TechnoSthanITServices = () => {
//   return (
//     <div className="it-wrapper">

//       {/* 🔥 SEO */}
//       <Helmet>
//         <title>IT Services | TechnoSthan</title>
//         <meta
//           name="description"
//           content="TechnoSthan IT Services offers web development, mobile apps, cloud & DevOps, and digital solutions."
//         />
//       </Helmet>

//       {/* Breadcrumb */}
//       <div className="breadcrumb">
//         Home &gt; Our Verticals &gt; IT Services
//       </div>

//       <div className="it-container">

//         {/* HERO */}
//         <motion.div 
//           className="it-hero"
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="it-badge">
//             <Rocket size={14} /> Technology Solutions
//           </div>

//           <h1>Engineering & IT Solutions</h1>

//           <p>
//             We build scalable, secure, and high-performance digital products 
//             using modern technologies and cloud infrastructure.
//           </p>
//         </motion.div>

//         {/* SERVICES */}
//         <div className="it-grid">
//           <div className="it-card">
//             <Code2 size={28} />
//             <h3>Web Development</h3>
//             <p>Modern web apps using React & scalable backend.</p>
//           </div>

//           <div className="it-card">
//             <Smartphone size={28} />
//             <h3>Mobile Apps</h3>
//             <p>Android & iOS apps with powerful UX.</p>
//           </div>

//           <div className="it-card">
//             <Cloud size={28} />
//             <h3>Cloud & DevOps</h3>
//             <p>CI/CD, deployment & cloud infrastructure.</p>
//           </div>

//           <div className="it-card">
//             <ShieldCheck size={28} />
//             <h3>Security</h3>
//             <p>Secure systems with optimized performance.</p>
//           </div>
//         </div>

//         {/* PROCESS */}
//         <div className="it-process">
//           <h2>How We Work</h2>
//           <div className="process-steps">
//             <span>1. Analysis</span>
//             <span>2. Design</span>
//             <span>3. Development</span>
//             <span>4. Testing</span>
//             <span>5. Deployment</span>
//           </div>
//         </div>

//         {/* TECH STACK */}
//         <div className="it-tech">
//           <h2>Technologies</h2>
//           <div className="tech-tags">
//             <span>React</span>
//             <span>Node.js</span>
//             <span>MongoDB</span>
//             <span>AWS</span>
//             <span>Docker</span>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="it-stats">
//           <div><strong>100+</strong><span>Projects</span></div>
//           <div><strong>99%</strong><span>Satisfaction</span></div>
//           <div><strong>24/7</strong><span>Support</span></div>
//         </div>

//         {/* CTA */}
//         <div className="it-cta">
//           <h2>Start Your Project</h2>
//           <Link to="/contact" className="cta-btn">Contact Us</Link>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default TechnoSthanITServices;
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code2,
  Cloud,
  TrendingUp,
  Briefcase,
  Rocket
} from "lucide-react";
import "./ServicesPage.css";

const TechnoSthanITServices = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120 }
    }
  };

  // 🔥 FINAL 4 SERVICES (ORGANIZATION STRUCTURE)
  const services = [
    {
      icon: <Code2 size={28} />,
      title: "Engineering & Development",
      desc: "Web, Mobile, API, and secure scalable systems.",
      path: "/engineering"
    },
    {
      icon: <Cloud size={28} />,
      title: "Cloud & DevOps",
      desc: "Cloud infrastructure, CI/CD, and deployment automation.",
      path: "/cloud"
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Digital Growth",
      desc: "SEO, marketing, and data-driven growth strategies.",
      path: "/digital-growth"
    },
    {
      icon: <Briefcase size={28} />,
      title: "IT Consulting",
      desc: "Technology strategy, architecture, and business solutions.",
      path: "/consulting"
    }
  ];

  return (
    <div className="growth-wrapper">

      {/* Background */}
      <div className="circle-bg one"></div>
      <div className="circle-bg two"></div>

      <div className="growth-container">

        {/* HEADER */}
        <motion.div 
          className="growth-header"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="growth-badge">
            <Rocket size={14} /> <span>Technology Solutions</span>
          </div>

          <h1 className="growth-title">
            Our Core Services
          </h1>

          <p className="growth-lead">
            We provide end-to-end technology solutions including development, 
            cloud infrastructure, digital growth, and IT consulting.
          </p>
        </motion.div>

        {/* SERVICES GRID */}
        <motion.div 
          className="strategy-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10 }}
            >
              <Link to={item.path} className="strategy-card">
                <div className="strategy-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="card-arrow">
                  <span>Explore</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* STATS */}
        <motion.div 
          className="stats-banner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat"><strong>100+</strong> <span>Projects</span></div>
          <div className="stat"><strong>99%</strong> <span>Client Satisfaction</span></div>
          <div className="stat"><strong>24/7</strong> <span>Support</span></div>
        </motion.div>

      </div>
    </div>
  );
};

export default ServicesPage;