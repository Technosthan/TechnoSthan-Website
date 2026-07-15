import React from "react";
import "./ProcessWheel.css";

const steps = [
  "Discovery",
  "Discuss (Planning)",
  "Design",
  "Development",
  "Debugging (Testing)",
  "Deployment",
];

const ProcessWheel = () => {
  return (
    <section className="process-wheel-section">
      <div className="process-wheel-container">
        <div className="wheel" aria-hidden="true">
          {steps.map((label, i) => {
            const angle = (360 / steps.length) * i;
            return (
              <div
                key={label}
                className="wheel-item"
                style={{
                  transform: `rotate(${angle}deg) translateY(-12.5rem) rotate(-${angle}deg)`,
                }}
              >
                <div
                  className="wheel-card"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
                  }}
                >
                  <span className="wheel-step">{i + 1}</span>
                  <h4 className="wheel-title">{label}</h4>
                </div>
              </div>
            );
          })}
        </div>

        <div className="wheel-center">
          <div className="wheel-center-inner">
            <h3>Technosthan Process</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessWheel;