import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Code2, Cloud, TrendingUp, Lightbulb, ArrowRight, ExternalLink } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import CTASection from '../components/CTA';
import './ServicesPage.css';

const SERVICES = [
  {
    icon: <Code2 size={32} />,
    title: 'Engineering & Development',
    subtitle: 'technosthan-it-services',
    desc: 'We build scalable, performant web and mobile applications, custom APIs, and enterprise software tailored to your exact business requirements.',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.04))',
    path: '/engineering',
    offerings: ['Custom Web Apps', 'Mobile Development', 'API & Microservices', 'E-Commerce Platforms', 'SaaS Products'],
    tech: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS'],
  },
  {
    icon: <Cloud size={32} />,
    title: 'Cloud & DevOps',
    subtitle: 'technosthan-cloud',
    desc: 'From infrastructure-as-code to fully automated CI/CD pipelines — we manage your cloud operations on AWS, Azure, and GCP with zero downtime.',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.04))',
    path: '/cloud',
    offerings: ['Cloud Migration', 'Kubernetes Orchestration', 'CI/CD Automation', 'Infrastructure as Code', 'Cost Optimization'],
    tech: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins'],
  },
  {
    icon: <TrendingUp size={32} />,
    title: 'Digital Growth',
    subtitle: 'technosthan-growth',
    desc: 'Data-driven digital marketing that compounds — SEO, paid media, conversion optimization, and analytics dashboards that turn traffic into revenue.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.04))',
    path: '/digital-growth',
    offerings: ['SEO & Content Strategy', 'PPC Campaigns', 'Conversion Rate Optimization', 'Social Media Growth', 'Analytics & Reporting'],
    tech: ['GA4', 'Google Ads', 'Meta Ads', 'SEMrush', 'HubSpot'],
  },
  {
    icon: <Lightbulb size={32} />,
    title: 'IT Consulting',
    subtitle: 'technosthan-consulting',
    desc: 'Strategic technology advisory from senior architects and CTOs. We audit your tech stack, design digital roadmaps, and lead transformation programs.',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.04))',
    path: '/consulting',
    offerings: ['Tech Stack Audit', 'Digital Roadmapping', 'CTO-as-a-Service', 'Compliance & Security', 'Vendor Assessment'],
    tech: ['TOGAF', 'ITIL', 'ISO 27001', 'Agile', 'SAFe'],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Our Verticals — TechnoSthan IT Services</title>
        <meta name="description" content="Explore TechnoSthan's four specialized verticals: Engineering, Cloud & DevOps, Digital Growth, and IT Consulting." />
      </Helmet>

      <Breadcrumb items={[{ label: 'Services' }]} />

      {/* Page Hero */}
      <section className="services-hero">
        <div className="grid-bg services-hero__grid" />
        <div className="services-hero__orb" />
        <div className="container">
          <motion.div
            className="services-hero__content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="services-hero__eyebrow">Our Verticals</span>
            <h1 className="services-hero__title">
              Specialized Expertise,<br />
              <span className="gradient-text">Unified Delivery</span>
            </h1>
            <p className="services-hero__subtitle">
              Four dedicated verticals, one goal — accelerate your digital transformation with precision, expertise, and accountability at every step.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-pad">
        <div className="container">
          <div className="services-list">
            {SERVICES.map((service, i) => (
              <motion.div
                key={i}
                className="service-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="service-card__left">
                  <div className="service-card__icon" style={{ background: service.gradient, color: service.color }}>
                    {service.icon}
                  </div>
                  <div className="service-card__number">{String(i + 1).padStart(2, '0')}</div>
                </div>

                <div className="service-card__content">
                  <div className="service-card__slug" style={{ color: service.color }}>/{service.subtitle}</div>
                  <h2 className="service-card__title">{service.title}</h2>
                  <p className="service-card__desc">{service.desc}</p>

                  <div className="service-card__offerings">
                    {service.offerings.map((o, j) => (
                      <div key={j} className="service-card__offering">
                        <span className="service-card__offering-dot" style={{ background: service.color }} />
                        {o}
                      </div>
                    ))}
                  </div>

                  <div className="service-card__tech">
                    {service.tech.map((t, j) => (
                      <span key={j} className="service-card__tech-tag">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="service-card__action">
                  <Link to={service.path} className="service-card__btn" style={{ '--c': service.color, '--cb': `${service.color}20`, '--cbr': `${service.color}40` }}>
                    View Vertical
                    <ArrowRight size={16} />
                  </Link>
                  <div className="service-card__line" style={{ background: service.color }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}