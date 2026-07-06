import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
} from "lucide-react";
import HeroSection from "../components/HeroSection";
import SectionHeader from "../../../shared/components/SectionHeader";
import ProgramCard from "../../skill-programs/components/ProgramCard";
import { apiClient } from "../../../shared/services/apiClient";
import { programsData as fallbackPrograms } from "../../skill-programs/data/programsData";
import {
  homeStats,
  innovationLabs,
  learningJourney,
  outcomeCards,
  projectShowcase,
  trustedPartners,
  workshopHighlights,
} from "../data/homeData";

const Home = () => {
  const [hero, setHero] = useState(null);
  const [programs, setPrograms] = useState(fallbackPrograms);
  const [workshops, setWorkshops] = useState(workshopHighlights);

  useEffect(() => {
    const load = async () => {
      try {
        const [heroResponse, programsResponse, workshopsResponse] =
          await Promise.allSettled([
            apiClient.get("/hero"),
            apiClient.get("/programs"),
            apiClient.get("/workshops"),
          ]);

        if (heroResponse.status === "fulfilled") {
          setHero(heroResponse.value.hero);
        }

        if (programsResponse.status === "fulfilled" && programsResponse.value.programs?.length) {
          setPrograms(programsResponse.value.programs);
        }

        if (workshopsResponse.status === "fulfilled" && workshopsResponse.value.workshops?.length) {
          setWorkshops(workshopsResponse.value.workshops);
        }
      } catch (_error) {
        // Keep static fallbacks in place when the API is unavailable.
      }
    };

    load();
  }, []);

  return (
    <>
      <HeroSection hero={hero} />

      <section className="section">
        <div className="container">
          <div className="brand-strip glass">
            <p className="section-eyebrow">Trusted by learners from</p>
            <div className="brand-row">
              {trustedPartners.map((partner) => (
                <span key={partner} className="brand-pill">
                  {partner}
                </span>
              ))}
            </div>
          </div>
          <div className="stats-grid">
            {homeStats.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card glass stat-card"
              >
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Programs Preview"
            title="Premium programs built for ambitious learners"
            description="Each route blends practical labs, portfolio work, and real outcomes."
          />
          <div className="grid cards-grid-3">
            {programs.slice(0, 6).map((program) => (
              <ProgramCard key={program.id || program.title} program={program} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Learning Journey"
            title="From guidance to placement confidence"
            description="A structured path that keeps progress visible and momentum high."
          />
          <div className="timeline-shell glass">
            {learningJourney.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="timeline-step-card"
              >
                <div className="timeline-icon-wrap">
                  <step.icon size={16} />
                </div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Live Projects"
            title="Real products students can proudly showcase"
            description="Every project reflects technical execution and practical problem-solving."
          />
          <div className="grid cards-grid-3">
            {projectShowcase.map((project) => (
              <motion.article
                key={project.title}
                whileHover={{ y: -6, scale: 1.01 }}
                className="card glass project-card"
              >
                <div className="project-visual">
                  <project.icon size={22} />
                </div>
                <div className="project-badge">{project.tag}</div>
                <h3>{project.title}</h3>
                <p>{project.meta}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Workshops Highlight"
            title="Fast-paced sessions with expert-led mentorship"
            description="Join practical workshops designed for rapid certification and portfolio growth."
          />
          <div className="grid cards-grid-3">
            {workshops.map((item) => (
              <motion.article
                key={item.title}
                whileHover={{ y: -6, scale: 1.01 }}
                className="card glass workshop-card"
              >
                <div className="workshop-top">
                  <span className="program-badge">{item.badge || "Workshop"}</span>
                  <span className="meta-pill">
                    {item.date ? new Date(item.date).toLocaleDateString("en-IN") : "Upcoming"}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="workshop-meta-row">
                  <span>
                    <CalendarDays size={14} /> {item.mode}
                  </span>
                  <span>
                    <BookOpen size={14} /> {item.seatsLeft ?? item.seats ?? "Seats available"}
                  </span>
                </div>
                <a href="/contact" className="btn btn-secondary">
                  Enroll Now <ArrowRight size={16} />
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Innovation Labs"
            title="Spaces made for experimentation and product thinking"
            description="Hands-on environments for research, prototyping, and advanced learning."
          />
          <div className="innovation-grid">
            {innovationLabs.map((lab) => (
              <motion.article
                key={lab.title}
                whileHover={{ y: -6, scale: 1.01 }}
                className="card glass innovation-card"
              >
                <div className="innovation-icon-wrap">
                  <lab.icon size={18} />
                </div>
                <h3>{lab.title}</h3>
                <p>{lab.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Student Success"
            title="Outcomes that make a real difference"
            description="The goal is simple: turn skills into credible career momentum."
          />
          <div className="grid cards-grid-4">
            {outcomeCards.map((item) => (
              <motion.article
                key={item.title}
                whileHover={{ y: -6, scale: 1.01 }}
                className="card glass outcome-card"
              >
                <div className="innovation-icon-wrap">
                  <item.icon size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card glass cta-card"
          >
            <div>
              <p className="badge">Ready to begin?</p>
              <h3>Build your future with practical innovation and real projects.</h3>
              <p>
                Join TechnoSthan Innovation Hub for training, internships,
                startup support, and portfolio-ready growth.
              </p>
            </div>
            <a href="/skill-programs" className="btn btn-primary">
              Enroll Now <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
