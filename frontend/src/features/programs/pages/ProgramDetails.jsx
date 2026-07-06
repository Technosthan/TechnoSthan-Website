import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  BookOpen,
  Clock3,
  Layers3,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { apiClient } from "../../../shared/services/apiClient";
import { useAuth } from "../../../shared/hooks/useAuth";
import { ROUTES } from "../../../shared/constants/routes";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const ProgramDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const response = await apiClient.get(`/programs/${slug}`);
        setProgram(response.program);
      } catch (err) {
        setError(err.message || "Program not found");
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [slug]);

  useEffect(() => {
    if (window.Razorpay) {
      return undefined;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const modules = useMemo(() => program?.curriculumModules || [], [program]);
  const projects = useMemo(() => program?.projects || [], [program]);
  const faqs = useMemo(() => program?.faqs || [], [program]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: `/programs/${slug}` } });
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiClient.post(`/enrollments/${program.id}`, {});
      if (window.Razorpay && response.order) {
        const checkout = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: response.order.amount,
          currency: response.order.currency,
          name: "TechnoSthan Innovation Hub",
          description: program.title,
          order_id: response.order.id,
          handler: async (paymentResponse) => {
            await apiClient.post("/payments/verify", {
              orderId: response.order.id,
              paymentId: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
            });
            navigate("/payment-success", {
              state: { programTitle: program.title, amount: response.order.amount / 100 },
            });
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || "",
          },
          theme: { color: "#5ee7ff" },
        });
        checkout.open();
      } else {
        await apiClient.post("/payments/verify", {
          orderId: response.order.id,
          paymentId: response.order.id,
          signature: "mock-signature",
        });
        navigate("/payment-success", {
          state: { programTitle: program.title, amount: response.order.amount / 100 },
        });
      }
    } catch (err) {
      setError(err.message || "Unable to start enrollment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <section className="section"><div className="container">Loading...</div></section>;
  }

  if (error || !program) {
    return (
      <section className="section">
        <div className="container">
          <div className="card glass">
            <h1>Program not found</h1>
            <p className="muted-copy">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container program-details-shell">
        <div className="program-details-hero card glass">
          <div>
            <p className="badge">{program.category || program.level}</p>
            <h1>{program.title}</h1>
            <p className="muted-copy">{program.overview}</p>
            <div className="program-meta">
              <span className="meta-pill"><Clock3 size={12} /> {program.duration}</span>
              <span className="meta-pill"><Sparkles size={12} /> {program.level}</span>
              <span className="meta-pill"><Layers3 size={12} /> {program.mode}</span>
              <span className="meta-pill"><Users size={12} /> {program.projectsCount || projects.length} Projects</span>
            </div>
            <div className="program-price-box">
              <strong>{formatCurrency(program.discountFees || program.fees)}</strong>
              {program.discountFees ? <span>{formatCurrency(program.fees)}</span> : null}
            </div>
            <button className="btn btn-primary" onClick={handleEnroll} disabled={actionLoading}>
              <PlayCircle size={18} />
              {actionLoading ? "Starting..." : "Enroll Now"}
            </button>
          </div>
          {program.heroImageUrl || program.thumbnailUrl ? (
            <img className="program-hero-image" src={program.heroImageUrl || program.thumbnailUrl} alt={program.title} />
          ) : null}
        </div>

        <div className="program-details-grid">
          <article className="card glass">
            <h2>What you will learn</h2>
            <ul className="detail-list">
              {(program.whatYouWillLearn || []).map((item) => (
                <li key={item}><BadgeCheck size={14} /> {item}</li>
              ))}
            </ul>
          </article>

          <article className="card glass">
            <h2>Curriculum modules</h2>
            <div className="module-stack">
              {modules.map((module) => (
                <div key={module.id} className="module-card">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <ul className="detail-list">
                    {(module.lessons || []).map((lesson) => (
                      <li key={lesson.id}>
                        <BadgeCheck size={14} /> {lesson.title} {lesson.duration ? `• ${lesson.duration}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          <article className="card glass">
            <h2>Projects</h2>
            <div className="module-stack">
              {projects.map((project) => (
                <div key={project.id} className="module-card">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p className="muted-copy">{project.tools}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card glass">
            <h2>Support</h2>
            <p className="muted-copy">{program.placementSupport || "Placement and internship support available."}</p>
            <div className="program-meta">
              <span className="meta-pill">{program.certificateIncluded ? "Certificate included" : "Certificate not included"}</span>
              <span className="meta-pill">{program.internshipSupport ? "Internship support" : "No internship support"}</span>
            </div>
          </article>

          <article className="card glass">
            <h2>Mentor</h2>
            <p className="muted-copy">{program.mentorName}</p>
            <p className="muted-copy">{program.mentorRole}</p>
            <p className="muted-copy">{program.mentorBio}</p>
          </article>

          <article className="card glass">
            <h2>FAQs</h2>
            <div className="module-stack">
              {(faqs || []).map((faq, index) => (
                <div key={faq.question || index} className="module-card">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default ProgramDetails;
