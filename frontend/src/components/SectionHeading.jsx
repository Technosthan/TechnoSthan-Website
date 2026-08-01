import { useTheme } from "../contexts/ThemeContext";

const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={[
        "mx-auto max-w-3xl",
        align === "left" ? "text-left" : "text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? (
        <p
          className={`mb-3 text-sm font-semibold uppercase tracking-[0.28em] ${theme.accent}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-balance text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${theme.text}`}>
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg ${theme.textSecondary}`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

export default SectionHeading;
