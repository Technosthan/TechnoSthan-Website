import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

import ProjectMedia from "./ProjectMedia";
import {
  getProjectFocusLabel,
  getProjectThemes,
  normalizeText,
} from "../data/portfolioData";

const PortfolioVisual = ({ projects = [] }) => {
  const lead = projects[0] || null;
  const secondary = projects[1] || null;
  const tertiary = projects[2] || null;
  const themes = getProjectThemes(lead || {});

  return (
    <div className="portfolio-visual">
      <div className="portfolio-visual__frame portfolio-visual__frame--lead">
        <ProjectMedia project={lead} eager />
        <div className="portfolio-visual__caption">
          <span className="portfolio-visual__eyebrow">Lead case study</span>
          <strong>{normalizeText(lead?.title, "Active project")}</strong>
          <span>{getProjectFocusLabel(lead || {})}</span>
        </div>
      </div>

      <div className="portfolio-visual__stack">
        <div className="portfolio-visual__frame portfolio-visual__frame--secondary">
          <ProjectMedia project={secondary} />
          <div className="portfolio-visual__caption portfolio-visual__caption--compact">
            <span>{normalizeText(secondary?.title, "Project record")}</span>
          </div>
        </div>

        <div className="portfolio-visual__frame portfolio-visual__frame--tertiary">
          <ProjectMedia project={tertiary} />
          <div className="portfolio-visual__caption portfolio-visual__caption--compact">
            <span>{normalizeText(tertiary?.title, "Project record")}</span>
          </div>
        </div>
      </div>

      <div className="portfolio-visual__data">
        <div className="portfolio-visual__signal">
          <span className="portfolio-visual__signal-label">Themes</span>
          <div className="portfolio-visual__chips">
            {themes.length > 0 ? (
              themes.map((theme) => (
                <span key={theme.key} className="portfolio-visual__chip">
                  {theme.label}
                </span>
              ))
            ) : (
              <span className="portfolio-visual__chip">Enterprise delivery</span>
            )}
          </div>
        </div>

        <Link to="/case-studies" className="portfolio-visual__link">
          Open portfolio
          <FiArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default PortfolioVisual;

