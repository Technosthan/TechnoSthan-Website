const FeatureCard = ({ title, description, icon }) => {
  return (
    <article className="card glass">
      <div
        className="gradient-text"
        style={{ fontSize: "1.8rem", marginBottom: "0.7rem" }}
      >
        {icon}
      </div>
      <h3 style={{ margin: "0 0 0.6rem" }}>{title}</h3>
      <p style={{ color: "#9aa9c2", lineHeight: 1.7, margin: 0 }}>
        {description}
      </p>
    </article>
  );
};

export default FeatureCard;
