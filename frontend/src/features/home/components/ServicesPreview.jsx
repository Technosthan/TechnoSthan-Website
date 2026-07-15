import {
  FiArrowRight,
  FiCode,
  FiSmartphone,
  FiCloud,
  FiCpu,
  FiShield,
  FiLayers,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";
import "./services.css";

const ServicesPreview = () => {
  const services = [
    {
      icon: FiCode,
      title: "Web Development",
      desc: "Custom business websites and scalable web applications built with modern technologies",
    },
    {
      icon: FiSmartphone,
      title: "Mobile Apps",
      desc: "Native and cross-platform Android & iOS applications with seamless performance",
    },
    {
      icon: FiCloud,
      title: "Cloud Solutions",
      desc: "AWS & scalable infrastructure for enterprise-grade applications",
    },
    {
      icon: FiCpu,
      title: "AI Solutions",
      desc: "Automation & intelligent systems powered by machine learning",
    },
    {
      icon: FiShield,
      title: "Cyber Security",
      desc: "Enterprise-grade protection and vulnerability assessment",
    },
    {
      icon: FiLayers,
      title: "UI/UX Design",
      desc: "Modern user experiences with premium design principles",
    },
    {
      icon: FiTrendingUp,
      title: "Data Analytics",
      desc: "Insights & reporting solutions for data-driven decisions",
    },
    {
      icon: FiCheckCircle,
      title: "DSC Services",
      desc: "Digital strategy, consulting, and management solutions",
    },
  ];

  return (
    <section className="services-preview">
      {/* Section Header */}
      <div className="section-header">
        <span className="section-badge">
          <span className="badge-dot"></span>
          Our Services
        </span>

        <h2>Enterprise Solutions for Every Challenge</h2>

        <p>
          Comprehensive IT services tailored to transform your business and
          drive growth
        </p>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {services.map((service) => {
          const IconComponent = service.icon;

          return (
            <div key={service.title} className="service-card">
              <div className="icon-glow"></div>

              <div className="icon-container">
                <IconComponent size={32} />
              </div>

              <h3>{service.title}</h3>
              <p>{service.desc}</p>

              <div className="card-arrow">
                <FiArrowRight size={20} />
              </div>

              <div className="card-glow"></div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="services-cta">
        <h3>Ready to get started?</h3>

        <p>Let's discuss how our services can transform your business</p>

        <button className="btn-primary">
          Schedule Consultation
        </button>
      </div>
    </section>
  );
};

export default ServicesPreview;