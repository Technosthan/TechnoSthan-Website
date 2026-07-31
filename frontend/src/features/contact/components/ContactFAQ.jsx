import { useState } from "react";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";

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

const ContactFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs.length) {
    return null;
  }

  return (
    <section className="contact-faq" data-motion-zone="cta" aria-labelledby="contact-faq-heading">
      <div className="contact-enterprise__shell contact-faq__shell">
        <header className="contact-faq__intro" data-contact-reveal>
          <span className="section-badge">
            <span className="badge-dot" />
            FAQ
          </span>
          <h2 id="contact-faq-heading">Answers that make the first conversation easier.</h2>
          <p>
            These are the practical questions teams usually ask before they submit a request.
          </p>
        </header>

        <div className="contact-faq__grid" data-contact-reveal>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `contact-faq-panel-${index}`;

            return (
              <article key={faq.question} className={`contact-faq__card ${isOpen ? "is-open" : ""}`.trim()}>
                <button
                  type="button"
                  className="contact-faq__trigger"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <div className="contact-faq__question">
                    <span className="contact-faq__index">0{index + 1}</span>
                    <h3>{faq.question}</h3>
                  </div>
                  <FiChevronDown className="contact-faq__chevron" aria-hidden="true" />
                </button>

                <div id={panelId} className={`contact-faq__answer ${isOpen ? "is-open" : ""}`.trim()}>
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

export default ContactFAQ;

