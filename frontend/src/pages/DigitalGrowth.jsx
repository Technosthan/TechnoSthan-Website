import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Search,
  Share2,
  MapPin,
  FileText,
  Star,
  Link as LinkIcon,
  Rocket
} from "lucide-react";
import "./DigitalGrowth.css";

const DigitalGrowthPage = () => {

  const services = [
    {
      icon: <Search size={28} />,
      title: "SEO (Search Engine Optimization)",
      desc: "Improve rankings and visibility on Google and search engines."
    },
    {
      icon: <Share2 size={28} />,
      title: "Social Media Optimization",
      desc: "Grow your presence across social platforms and engage audience."
    },
    {
      icon: <MapPin size={28} />,
      title: "Local SEO Services",
      desc: "Boost visibility for local searches and nearby customers."
    },
    {
      icon: <FileText size={28} />,
      title: "Content Marketing",
      desc: "Create valuable content to attract and convert customers."
    },
    {
      icon: <Star size={28} />,
      title: "Online Reputation Management",
      desc: "Manage brand image and build trust online."
    },
    {
      icon: <LinkIcon size={28} />,
      title: "Link Building",
      desc: "High-quality backlinks to improve authority and ranking."
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Website Optimization",
      desc: "Speed, performance, and UX improvements for better conversions."
    }
  ];

  return (
    <div className="dg-wrapper">

      {/* SEO */}
      <Helmet>
        <title>Digital Growth | TechnoSthan</title>
        <meta
          name="description"
          content="SEO, social media marketing, content marketing, and digital growth services to scale your business online."
        />
      </Helmet>

      {/* HERO */}
      <section className="dg-hero">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Digital Growth & Marketing
        </motion.h1>

        <p>
          We help businesses grow online with data-driven marketing strategies, 
          SEO optimization, and brand positioning.
        </p>
      </section>

      {/* SERVICES */}
      <section className="dg-services">
        {services.map((item, index) => (
          <motion.div
            key={index}
            className="dg-card"
            whileHover={{ y: -10 }}
          >
            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* PROCESS */}
      <section className="dg-process">
        <h2>Our Growth Strategy</h2>

        <div className="process-grid">
          <div>1. Research</div>
          <div>2. Strategy</div>
          <div>3. Execution</div>
          <div>4. Optimization</div>
          <div>5. Scaling</div>
        </div>
      </section>

      {/* CTA */}
      <section className="dg-cta">
        <Rocket size={30} />
        <h2>Ready to Grow Your Business?</h2>
        <p>Let’s scale your brand with proven digital strategies.</p>
        <button>Get Started</button>
      </section>

    </div>
  );
};

export default DigitalGrowthPage;