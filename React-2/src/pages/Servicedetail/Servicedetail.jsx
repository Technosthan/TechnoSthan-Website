import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import StatsSection from '../components/Stats';
import CTASection from '../components/CTA';
import { SectionWrapper, SectionHeading, FadeUp } from '../components/SectionWrapper';
import './ServiceDetail.css';

export default function ServiceDetail({ data }) {
  const { meta, hero, offerings, process, technologies, stats, whyUs, color, accentGradient } = data;

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <Breadcrumb items={[
        { label: 'Services', path: '/services' },
        { label: hero.title },
      ]} />

      {/* Hero */}
      <section className="sd-hero" style={{ '--service-color': color }}>
        <div className="grid-bg sd-hero__grid" />
        <div className="sd-hero__orb" style={{ background: `radial-gradient(circle, ${color}25, transparent 60%)` }} />
        <div className="container sd-hero__inner">
          <motion.div
            className="sd-hero__content"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sd-hero__eyebrow" style={{ color, background: `${color}15`, border: `1px solid ${color}35` }}>
              {hero.eyebrow}
            </div>
            <h1 className="sd-hero__title">
              {hero.title}
              <br />
              <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {hero.titleAccent}
              </span>
            </h1>
            <p className="sd-hero__subtitle">{hero.subtitle}</p>
            <div className="sd-hero__actions">
              <Link to="/contact" className="btn-primary" style={{ background: accentGradient }}>
                Start a Project <ArrowRight size={16} />
              </Link>
              <Link to="/services" className="btn-ghost">
                ← All Verticals
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="sd-hero__visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="sd-hero__icon-wrap" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
              <div style={{ color, transform: 'scale(2.4)' }}>{hero.icon}</div>
            </div>
            <div className="sd-hero__checklist">
              {hero.highlights.map((h, i) => (
                <motion.div
                  key={i}
                  className="sd-hero__check"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <CheckCircle2 size={14} style={{ color }} />
                  {h}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <SectionWrapper>
        <div className="container">
          <SectionHeading
            eyebrow="What We Offer"
            title={<>Our Core <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Capabilities</span></>}
            subtitle={offerings.subtitle}
          />
          <div className="sd-offerings-grid">
            {offerings.items.map((item, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <div className="sd-offering-card" style={{ '--sc': color }}>
                  <div className="sd-offering-card__icon" style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}>
                    {item.icon}
                  </div>
                  <h3 className="sd-offering-card__title">{item.title}</h3>
                  <p className="sd-offering-card__desc">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Process */}
      <SectionWrapper>
        <div className="container">
          <SectionHeading
            eyebrow="Our Process"
            title={<>How We <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Deliver</span></>}
            subtitle="A structured, transparent workflow tailored to your goals."
          />
          <div className="sd-process">
            {process.map((step, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="sd-process__step">
                  <div className="sd-process__num" style={{ color, borderColor: `${color}40` }}>{String(i + 1).padStart(2, '0')}</div>
                  <div className="sd-process__body">
                    <h4 className="sd-process__title">{step.title}</h4>
                    <p className="sd-process__desc">{step.desc}</p>
                  </div>
                  {i < process.length - 1 && <div className="sd-process__connector" style={{ background: `linear-gradient(90deg, ${color}50, transparent)` }} />}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Technologies */}
      <SectionWrapper>
        <div className="container">
          <SectionHeading
            eyebrow="Tech Stack"
            title="Technologies We Use"
            subtitle="Industry-standard tools and frameworks we're experts in."
          />
          <div className="sd-tech-grid">
            {technologies.map((tech, i) => (
              <FadeUp key={i} delay={i * 0.04}>
                <div className="sd-tech-tag" style={{ '--sc': color }}>
                  {tech.icon && <span style={{ color }}>{tech.icon}</span>}
                  {tech.name}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Stats */}
      <StatsSection stats={stats} />

      {/* Why Choose Us */}
      <SectionWrapper>
        <div className="container">
          <SectionHeading
            eyebrow="Why Choose Us"
            title={<>The <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>TechnoSthan</span> Difference</>}
            subtitle="What sets us apart from the rest."
          />
          <div className="sd-why-grid">
            {whyUs.map((item, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="sd-why-card">
                  <div className="sd-why-card__icon" style={{ color, background: `${color}12`, border: `1px solid ${color}25` }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="sd-why-card__title">{item.title}</h4>
                    <p className="sd-why-card__desc">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <CTASection
        title={`Ready to Transform with\n${hero.title}?`}
        subtitle={`Partner with our ${hero.title} team to accelerate your digital journey. Let's build something extraordinary.`}
        primaryLabel="Start Your Project"
        secondaryLabel="Schedule a Consultation"
      />
    </>
  );
}