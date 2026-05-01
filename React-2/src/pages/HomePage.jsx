import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home">

      {/* 🔥 SEO */}
      <Helmet>
        <title>TechnoSthan | IT Solutions & Digital Services</title>
        <meta
          name="description"
          content="TechnoSthan provides IT services, cloud solutions, and digital growth strategies for modern businesses."
        />
      </Helmet>

      {/* HERO */}
      <section className="hero">
        <h1>Building Future-Ready Digital Solutions</h1>
        <p>
          We design and develop scalable software, cloud infrastructure,
          and digital growth strategies.
        </p>

        <div className="hero-btns">
          <Link to="/services" className="btn-primary">Explore Services</Link>
          <Link to="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services">
        <h2>Our Verticals</h2>

        <div className="service-grid">
          <Link to="/services/technosthan-it-services" className="card">
            Engineering & Development
          </Link>

          <Link to="/services/technosthan-cloud" className="card">
            Cloud & DevOps
          </Link>

          <Link to="/services/technosthan-growth" className="card">
            Digital Growth
          </Link>

          <Link to="/services/technosthan-consulting" className="card">
            IT Consulting
          </Link>
        </div>
      </section>

      {/* WHY US */}
      <section className="why">
        <h2>Why Choose Us</h2>
        <div className="why-grid">
          <div>✔ Scalable Solutions</div>
          <div>✔ Secure Systems</div>
          <div>✔ Modern Tech Stack</div>
          <div>✔ Fast Delivery</div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="process">
        <h2>Our Process</h2>
        <div className="steps">
          <span>1. Analysis</span>
          <span>2. Design</span>
          <span>3. Development</span>
          <span>4. Testing</span>
          <span>5. Deployment</span>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div><strong>100+</strong><span>Projects</span></div>
        <div><strong>50+</strong><span>Clients</span></div>
        <div><strong>99%</strong><span>Satisfaction</span></div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Your Project Today</h2>
        <Link to="/contact" className="btn-primary">Get Started</Link>
      </section>

    </div>
  );
};

export default HomePage;