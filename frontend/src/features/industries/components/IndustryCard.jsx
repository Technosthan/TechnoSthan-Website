const IndustryCard = ({ industry }) => {
  return (
    <div className="card glass">
      <h3>{industry}</h3>
      <p style={{ color: "#9aa9c2", lineHeight: 1.7 }}>
        Technology-driven collaboration for transformation, efficiency, and
        scalable innovation.
      </p>
    </div>
  );
};

export default IndustryCard;
