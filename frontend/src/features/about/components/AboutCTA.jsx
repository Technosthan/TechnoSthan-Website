import { useNavigate } from "react-router-dom";
import "./AboutCTA.css";

const AboutCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="about-cta">
      <div className="about-container">
        <h2>Ready to accelerate your roadmap?</h2>
        <p>
          Connect with the team, review the right capabilities, and move
          confidently toward delivery.
        </p>
        <button className="primary-btn" onClick={() => navigate("/login")}>
          Open Admin Login
        </button>
      </div>
    </section>
  );
};

export default AboutCTA;
