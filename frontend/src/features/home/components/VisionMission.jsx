import { motion } from "framer-motion";
import SectionHeader from "../../../shared/components/SectionHeader";
import FeatureCard from "../../../shared/components/FeatureCard";
import {
  BrainCircuit,
  BriefcaseBusiness,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { programsData } from "../../skill-programs/data/programsData";
import { rdServicesData } from "../../rd-services/data/rdServicesData";

const offers = [
  {
    title: "Technical Training",
    description: "Build core skills through practical learning blocks.",
  },
  {
    title: "Internship Programs",
    description: "Gain reality-based exposure with guided projects.",
  },
  {
    title: "Workshops & Bootcamps",
    description: "Fast-paced sessions led by mentors and experts.",
  },
  {
    title: "R&D & Product Development",
    description: "Turn ideas into prototypes and real solutions.",
  },
];

const workshops = [
  { title: "AI Tools Workshop", date: "12 Aug", mode: "Hybrid" },
  { title: "IoT & Robotics", date: "24 Aug", mode: "Offline" },
  { title: "Web Development Sprint", date: "5 Sep", mode: "Online" },
];

const projects = [
  { title: "Hospital Management", tag: "ERP", meta: "Full stack" },
  { title: "IoT Smart Agriculture", tag: "Embedded", meta: "Sensor-driven" },
  { title: "AI Attendance System", tag: "AI", meta: "Computer vision" },
];

const testimonies = [
  {
    name: "Aarav Sharma",
    course: "AI & ML",
    company: "TCS",
    package: "₹7.2 LPA",
    rating: "4.9/5",
  },
  {
    name: "Pooja Mehta",
    course: "Full Stack",
    company: "Infosys",
    package: "₹6.8 LPA",
    rating: "4.8/5",
  },
];

const labs = [
  "AI Lab",
  "Embedded Lab",
  "IoT Lab",
  "Robotics Lab",
  "PCB Lab",
  "Innovation Studio",
];

const whyChooseUs = [
  {
    title: "Live Projects",
    description: "Every learner builds something real.",
  },
  {
    title: "Industry Experts",
    description: "Mentors from product companies and labs.",
  },
  {
    title: "Placement Support",
    description: "Career guidance and internship pipelines.",
  },
  {
    title: "Innovation Labs",
    description: "Access to high-end facilities and tools.",
  },
];

const journeySteps = ["Learn", "Build", "Internship", "Placement", "Career"];

const VisionMission = () => {
  return (
    <>
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Our Programs"
            title="Premium programs for future-ready talent"
            description="Short, practical, and visually rich pathways that make growth exciting."
          />
          <div className="grid cards-grid-4">
            {offers.map((item) => (
              <FeatureCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={<Sparkles />}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Why Choose Us"
            title="An experience that keeps students moving"
            description="Learning is layered with mentorship, outcomes, and momentum."
          />
          <div className="grid cards-grid-4">
            {whyChooseUs.map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card glass feature-card"
              >
                <div className="gradient-text feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <h3>{item.title}</h3>
                <p className="muted-copy">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Learning Journey"
            title="From curiosity to career confidence"
            description="A guided path that turns learning into opportunity."
          />
          <div className="timeline-card glass">
            {journeySteps.map((step, index) => (
              <div key={step} className="timeline-step">
                <div className="timeline-icon">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3>{step}</h3>
                  <p className="muted-copy">
                    {index === 0
                      ? "Foundations and mentoring"
                      : index === 1
                        ? "Build projects and portfolios"
                        : index === 2
                          ? "Work on live internships"
                          : index === 3
                            ? "Receive placement support"
                            : "Step into career-ready roles"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Live Projects"
            title="Real work students can proudly showcase"
            description="Projects that reflect industry thinking and technical depth."
          />
          <div className="grid cards-grid-3">
            {projects.map((project) => (
              <motion.article
                key={project.title}
                whileHover={{ y: -6, scale: 1.01 }}
                className="card glass project-card"
              >
                <div className="project-badge">{project.tag}</div>
                <h3>{project.title}</h3>
                <p className="muted-copy">{project.meta}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Workshops"
            title="High-energy sessions that create momentum"
            description="Live, practical, and designed for rapid skill growth."
          />
          <div className="grid cards-grid-3">
            {workshops.map((item) => (
              <div key={item.title} className="card glass workshop-card">
                <div className="workshop-meta">
                  <span>{item.date}</span>
                  <span>{item.mode}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="muted-copy">
                  Register now for an immersive session with mentorship and
                  hands-on practice.
                </p>
                <a href="/contact" className="btn btn-secondary">
                  Register Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Student Success"
            title="Learners who turned skills into opportunities"
            description="Stories shaped by mentorship, projects, and strong career support."
          />
          <div className="grid cards-grid-2">
            {testimonies.map((item) => (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card glass testimonial-card"
              >
                <div className="testimonial-top">
                  <div>
                    <h3>{item.name}</h3>
                    <p className="muted-copy">{item.course}</p>
                  </div>
                  <span className="badge">{item.rating}</span>
                </div>
                <p className="muted-copy">
                  Placed at {item.company} with {item.package}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Innovation Lab"
            title="Spaces built for experimentation and product thinking"
            description="Labs and studios that support exploration, prototyping, and advanced technologies."
          />
          <div className="innovation-grid">
            {labs.map((lab) => (
              <motion.div
                key={lab}
                whileHover={{ y: -6, scale: 1.01 }}
                className="card glass innovation-card"
              >
                <div className="gradient-text feature-icon">
                  <BrainCircuit size={18} />
                </div>
                <h3>{lab}</h3>
                <p className="muted-copy">
                  Advanced learning spaces for rapid prototyping and innovation.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card glass cta-card">
            <div>
              <p className="badge">Ready to begin?</p>
              <h3>
                Shape your future with practical innovation and technical
                training.
              </h3>
              <p className="muted-copy">
                Join projects, workshops, internships, and startup support at
                TechnoSthan Innovation Hub.
              </p>
            </div>
            <a href="/contact" className="btn btn-primary">
              Apply Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default VisionMission;
