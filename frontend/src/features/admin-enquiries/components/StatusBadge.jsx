const StatusBadge = ({ status }) => {
  const className = `badge status-${status.toLowerCase()}`;
  return <span className={className}>{status}</span>;
};

export default StatusBadge;
