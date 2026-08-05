import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

const AuthLayout = ({ title, subtitle, trustMessage, children }) => {
  return (
    <div className="auth-shell">
      <section className="auth-shell__visual" aria-hidden="true">
        <div className="auth-shell__visual-inner">
          <div className="auth-brand">
            <div className="auth-brand__mark">
              <img src="/favicon.svg" alt="" />
            </div>
            <div className="auth-brand__copy">
              <span>TechnoSthan</span>
              <p>Premium digital experiences.</p>
            </div>
          </div>

          <div className="auth-hero-copy">
            <p className="auth-hero-copy__kicker">
              <Sparkles size={14} />
              Future-ready workspace
            </p>
            <h1>Innovating Today. Empowering Tomorrow.</h1>
            <p>
              TechnoSthan builds secure, modern solutions that help teams move
              faster with confidence, clarity, and scale.
            </p>
          </div>

          <div className="auth-trust-card">
            <ShieldCheck size={18} />
            <p>{trustMessage}</p>
          </div>
        </div>
        <div className="auth-shell__mesh auth-shell__mesh--one" />
        <div className="auth-shell__mesh auth-shell__mesh--two" />
        <div className="auth-shell__grid" />
        <div className="auth-shell__lines" />
      </section>

      <section className="auth-shell__content">
        <div className="auth-card">
          <div className="auth-card__header">
            <div className="auth-card__brand">
              <img src="/favicon.svg" alt="TechnoSthan" />
              <span>TechnoSthan</span>
            </div>
            <div className="auth-card__heading">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
          </div>

          {children}
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
