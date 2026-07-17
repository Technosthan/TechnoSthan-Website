import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
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
    <section className="faq-section">
      <div className="section-header">
        <span className="section-badge">
          <span className="badge-dot" />
          FAQs
        </span>
        <h2>Frequently Asked Questions</h2>
        <p>
          Quick answers to the questions businesses ask before starting a new
          product or platform engagement.
        </p>
      </div>

      <div className="faq-grid">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <button
              key={faq.question}
              type="button"
              className={`faq-card ${isOpen ? "is-open" : ""}`}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <div className="faq-card-header">
                <h3>{faq.question}</h3>
                <FiChevronDown className="faq-chevron" />
              </div>
              <div className={`faq-answer ${isOpen ? "is-open" : ""}`}>
                <p>{faq.answer}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
