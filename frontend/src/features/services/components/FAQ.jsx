import "./FAQ.css";

const faqs = [
  {
    question: "What services does Technosthan provide?",
    answer:
      "We provide web development, mobile app development, cloud solutions, AI automation, UI/UX design and cybersecurity services.",
  },
  {
    question: "How long does a project take?",
    answer:
      "Project timelines depend on complexity, but most projects range from 2 to 16 weeks.",
  },
  {
    question: "Do you provide support after deployment?",
    answer:
      "Yes, we offer maintenance, support and long-term partnership plans.",
  },
  {
    question: "Do you work with startups?",
    answer:
      "Yes, we work with startups, SMEs and enterprise organizations.",
  },
];

const FAQ = () => {
  return (
    <section className="faq-section">

      <div className="about-container">

        <h2>Frequently Asked Questions</h2>

        <div className="faq-grid">

          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-card faq-card"
            >
              <h3>{faq.question}</h3>

              <p>{faq.answer}</p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default FAQ;