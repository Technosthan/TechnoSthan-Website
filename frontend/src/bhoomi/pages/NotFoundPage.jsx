import React from "react";
import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";

const NotFoundPage = () => {
  return (
    <main className="bhoomi-shell bhoomi-shell--center">
      <SeoHead title="Page not found" description="The requested page does not exist." path="/404" />
      <section className="not-found">
        <p className="section-heading__eyebrow">404</p>
        <h1>We could not find that page.</h1>
        <p>The requested route is unavailable. Use the navigation to continue browsing TechnoSthan InfraReach.</p>
        <div className="page-hero__actions">
          <Link className="btn btn--primary" to="/">
            Back to home
          </Link>
          <Link className="btn btn--secondary" to="/projects">
            View projects
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
