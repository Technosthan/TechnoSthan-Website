const SectionHeader = ({ eyebrow, title, description }) => {
  return (
    <div className="section-heading">
      
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
};

export default SectionHeader;
