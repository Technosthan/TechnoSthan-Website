const Input = ({ className = "", ...props }) => {
  return <input className={`input ${className}`.trim()} {...props} />;
};

export default Input;
