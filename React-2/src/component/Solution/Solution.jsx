import React from "react";
import "./Solution.css";
import { useNavigate } from "react-router-dom";

const Solution = () => {
  const navigate = useNavigate();

  return (
    <section className="solution">

      <h1>Find Your Solution</h1>
      <p>Select your need and we’ll guide you to the best solution.</p>

      <div className="solution-grid">

        <div className="solution-card" onClick={() => navigate("/services/technosthan-hospitality")}>
          <h3>Hospitality Solutions?</h3>
          <p>Booking systems and management tools.</p>
        </div>

        <div className="solution-card" onClick={() => navigate("/services/technosthan-innovations-hub")}>
          <h3>Innovation & Apps?</h3>
          <p>Custom development and digital transformation.</p>
        </div>

        <div className="solution-card" onClick={() => navigate("/services/technosthan-agritech")}>
          <h3>AgriTech Solutions?</h3>
          <p>Farm automation and data-driven agriculture.</p>
        </div>

        <div className="solution-card" onClick={() => navigate("/services/technosthan-it-services")}>
          <h3>IT Support Needed?</h3>
          <p>Cloud engineering and cybersecurity services.</p>
        </div>

      </div>

    </section>
  );
};

export default Solution;