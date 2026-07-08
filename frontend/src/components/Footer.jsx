import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="section"
      style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "2rem",
        }}
      >
        <div>
          <h3 className="gradient-text">TechnoSthan Innovation Hub</h3>
          <p style={{ color: "#9aa9c2", lineHeight: 1.8, maxWidth: "470px" }}>
            Learn, innovate, build, and transform together.
          </p>
          <p style={{ color: "#9aa9c2", marginTop: "0.9rem" }}>
            A Research, Innovation & Technical Skill Development vertical of
            TechnoSthan.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h4 style={{ marginBottom: "0.8rem" }}>Explore</h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
                color: "#9aa9c2",
              }}
            >
              {["/", "/about", "/rd-services", "/programs", "/startup-support", "/industries", "/contact"].map((path) => (
                <Link key={path} to={path === "/" ? "/" : path}>
                  {path === "/"
                    ? "Home"
                    : path
                        .replace("/", "")
                        .replace("-", " ")
                        .replace(/(^\w|\s+\w)/g, (m) => m.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
