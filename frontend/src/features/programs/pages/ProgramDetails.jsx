import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  Clock3,
  Layers3,
  PlayCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { apiClient } from "../../../shared/services/apiClient";
import { useAuth } from "../../../shared/hooks/useAuth";
import { getMediaUrl, safeDecodeURIComponent } from "../../../shared/utils/media";
import { getProgramDetailsPath } from "../../../shared/utils/links";
import NotFoundState from "../../../shared/components/NotFoundState";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const buildMentorFallbackAvatar = (name = "") => {
  const initials = String(name || "M")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "M";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10253f"/>
          <stop offset="100%" stop-color="#0a1324"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="28" fill="url(#g)"/>
      <circle cx="80" cy="64" r="30" fill="#5ee7ff" fill-opacity="0.18"/>
      <circle cx="80" cy="58" r="18" fill="#5ee7ff"/>
      <path d="M42 128c8-22 27-32 38-32s30 10 38 32" fill="#5ee7ff" fill-opacity="0.22"/>
      <text x="80" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#f5f7ff">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const ProgramDetails = () => {
  const { identifier, slug } = useParams();
  const decodedIdentifier = safeDecodeURIComponent(identifier || slug || "").trim();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [mentorAvatarFailed, setMentorAvatarFailed] = useState(false);
  const isNotFound = error === "Program not found";

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const response = await apiClient.get(`/programs/${encodeURIComponent(decodedIdentifier)}`);
        setProgram(response.program);
        setError("");
      } catch (err) {
        setError(err.status === 404 ? "Program not found" : err.message || "Unable to load program");
        setProgram(null);
      } finally {
        setLoading(false);
      }
    };

    if (decodedIdentifier) {
      loadProgram();
    } else {
      setError("Program not found");
      setLoading(false);
    }
  }, [decodedIdentifier]);

  useEffect(() => {
    setVideoFailed(false);
    setImageFailed(false);
    setMentorAvatarFailed(false);
  }, [program?.id]);

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
  const faqs = useMemo(() => (Array.isArray(program?.faqs) ? program.faqs : []), [program]);
  const learnings = useMemo(
    () => (Array.isArray(program?.whatYouWillLearn) ? program.whatYouWillLearn : []),
    [program],
  );
  const heroVideoUrl = getMediaUrl(program?.heroVideoUrl, "video");
  const heroImageUrl = getMediaUrl(program?.heroImageUrl || program?.thumbnailUrl, "image");
  const mentorAvatarUrl = getMediaUrl(program?.mentorAvatarUrl, "image");
  const mentorAvatarFallback = buildMentorFallbackAvatar(program?.mentorName);
  const showHeroVideo = Boolean(program?.heroVideoUrl) && !videoFailed;
  const showHeroImage = Boolean(program?.heroImageUrl || program?.thumbnailUrl) && !imageFailed;
  const showMentorAvatar = Boolean(program?.mentorAvatarUrl) && !mentorAvatarFailed;

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(getProgramDetailsPath({ slug: decodedIdentifier }))}`);
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
        setError("Payment checkout is temporarily unavailable. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Unable to start enrollment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">Loading...</div>
      </section>
    );
  }

  if (error || !program) {
    if (isNotFound) {
      return (
        <section className="section">
          <div className="container">
            <NotFoundState
              title="Program not found"
              description="The program you opened no longer exists, was unpublished, or the link is invalid."
              primaryLabel="Browse programs"
              primaryTo="/programs"
              secondaryLabel="Back to home"
              secondaryTo="/"
            />
          </div>
        </section>
      );
    }

    return (
      <section className="section">
        <div className="container">
          <div className="card glass">
            <h1>Unable to load program</h1>
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
              <span className="meta-pill">
                <Clock3 size={12} /> {program.duration}
              </span>
              <span className="meta-pill">
                <Sparkles size={12} /> {program.level}
              </span>
              <span className="meta-pill">
                <Layers3 size={12} /> {program.mode}
              </span>
              <span className="meta-pill">
                <Users size={12} /> {program.projectsCount || projects.length} Projects
              </span>
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

          {showHeroVideo ? (
            <video
              className="program-hero-image"
              controls
              muted
              playsInline
              onError={() => setVideoFailed(true)}
            >
              <source src={heroVideoUrl} />
            </video>
          ) : showHeroImage ? (
            <img
              className="program-hero-image"
              src={heroImageUrl}
              alt={program.title}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="program-hero-image program-hero-placeholder">
              <div>
                <Sparkles size={24} />
                <p className="muted-copy">No media available</p>
              </div>
            </div>
          )}
        </div>

        <div className="program-details-grid">
          <article className="card glass">
            <h2>What you will learn</h2>
            <ul className="detail-list">
              {learnings.map((item) => (
                <li key={item}>
                  <BadgeCheck size={14} /> {item}
                </li>
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
                        <BadgeCheck size={14} /> {lesson.title}
                        {lesson.duration ? ` - ${lesson.duration}` : ""}
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
            <p className="muted-copy">
              {program.placementSupport || "Placement and internship support available."}
            </p>
            <div className="program-meta">
              <span className="meta-pill">
                {program.certificateIncluded ? "Certificate included" : "Certificate not included"}
              </span>
              <span className="meta-pill">
                {program.internshipSupport ? "Internship support" : "No internship support"}
              </span>
            </div>
          </article>

          <article className="card glass">
            <h2>Mentor</h2>
            <div className="program-mentor-card">
              <img
                className="program-mentor-avatar"
                src={showMentorAvatar ? mentorAvatarUrl : mentorAvatarFallback}
                alt={program.mentorName || "Mentor"}
                onError={(event) => {
                  if (event.currentTarget.src !== mentorAvatarFallback) {
                    event.currentTarget.src = mentorAvatarFallback;
                  } else {
                    setMentorAvatarFailed(true);
                  }
                }}
              />
              <div>
                <p className="muted-copy">{program.mentorName}</p>
                <p className="muted-copy">{program.mentorRole}</p>
                <p className="muted-copy">{program.mentorBio}</p>
              </div>
            </div>
          </article>

          <article className="card glass">
            <h2>FAQs</h2>
            <div className="module-stack">
              {faqs.map((faq, index) => (
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
