import { useNavigate } from "react-router-dom";
import "./AboutCTA.css";

const AboutCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="about-cta">

      <div className="about-container">

        <h2>
          Ready To Build Something Amazing?
        </h2>

        <button
          className="primary-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

      </div>

    </section>
  );
};

export default AboutCTA;
