const SectionHeader = ({ eyebrow, title, description }) => {
  return (
    <div className="section-heading">
      <p className="badge">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
};

export default SectionHeader;
