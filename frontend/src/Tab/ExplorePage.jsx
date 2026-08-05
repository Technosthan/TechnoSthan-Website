import React, { useState } from "react";
import "./ExplorePage.css";

const services = [
  "Web Development",
  "App Development",
  "Digital Marketing",
  "AI Solutions"
];

const ExplorePage = () => {
  const [search, setSearch] = useState("");

  const filtered = services.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="explore-page">
      <div className="explore-center">

        <h1 className="explore-logo">Technosthan</h1>

        <div className="explore-search-box">
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="explore-services">
          {filtered.length > 0 ? (
            filtered.map((s, i) => (
              <div key={i} className="explore-card">
                {s}
              </div>
            ))
          ) : (
            <div className="no-results">
              No services found for "{search}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ExplorePage;