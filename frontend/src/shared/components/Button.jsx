const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const variantClass =
    variant === "secondary" ? "btn btn-secondary" : "btn btn-primary";
  return (
    <button className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};

export default Button;
