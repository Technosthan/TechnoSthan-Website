import SectionHeader from "../components/SectionHeader";
import ContactForm from "../components/ContactForm";

const Contact = () => {
  return (
    <section className="section">
      <div className="container">
       
        <div
          className="grid"
          style={{ gridTemplateColumns: "0.9fr 1.1fr", gap: "1.4rem" }}
        >
          <div className="card glass">
            <h3 className="gradient-text">Let’s build the future together</h3>
            <p style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
              Whether you are a student, researcher, startup founder, academic
              institution, or industry leader, we are ready to partner with you.
            </p>
            <ul style={{ color: "#9aa9c2", lineHeight: 1.8 }}>
              <li>Research collaborations</li>
              <li>Training and innovation programs</li>
              <li>Startup and product support</li>
              <li>Industry partnerships</li>
            </ul>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact;
