import { useState } from "react";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";
import "./FAQ.css";

const faqs = [
  {
    question: "What services does Technosthan provide?",
    answer:
      "We provide web development, mobile app development, cloud solutions, AI automation, UI/UX design, cybersecurity, and digital transformation support.",
  },
  {
    question: "How long does a project take?",
    answer:
      "Project timelines depend on complexity, but most engagements range from 2 to 16 weeks with clear milestones and delivery checkpoints.",
  },
  {
    question: "Do you provide support after deployment?",
    answer:
      "Yes, we offer maintenance, support, and long-term partnership plans so the product continues to evolve after launch.",
  },
  {
    question: "Do you work with startups and enterprise teams?",
    answer:
      "Yes, we partner with startups, SMEs, and enterprise organizations that want reliable digital delivery.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section" data-motion-zone="testimonials">
      <div className="faq-shell">
        <div className="faq-intro">
          <span className="section-badge" data-gsap="fade-up">
            <span className="badge-dot" />
            FAQs
          </span>
          <h2 data-gsap="text-reveal">Answers that help teams move faster</h2>
          <p data-gsap="fade-up">
            A few practical details about delivery, support, and the way we
            structure work for public-facing and internal platforms.
          </p>

          <div className="faq-callout" data-gsap="fade-up">
            <FiHelpCircle />
            <span>
              We keep the process transparent, which makes scoping, design
              decisions, and timelines easier to manage.
            </span>
          </div>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;

            return (
              <article
                key={faq.question}
                className={`faq-card ${isOpen ? "is-open" : ""}`}
                data-gsap-stagger
              >
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <div className="faq-question-wrap">
                    <span className="faq-index">0{index + 1}</span>
                    <h3>{faq.question}</h3>
                  </div>
                  <FiChevronDown className="faq-chevron" />
                </button>

                <div
                  id={panelId}
                  className={`faq-answer ${isOpen ? "is-open" : ""}`}
                >
                  <p>{faq.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
