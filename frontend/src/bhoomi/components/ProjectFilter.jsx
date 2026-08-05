import React from "react";
import { projectFilters } from "../data";

const ProjectFilter = ({ active, onChange, filters = projectFilters }) => {
  return (
    <div className="project-filter" role="tablist" aria-label="Project filters">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`project-filter__button ${active === filter ? "is-active" : ""}`}
          onClick={() => onChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default ProjectFilter;
