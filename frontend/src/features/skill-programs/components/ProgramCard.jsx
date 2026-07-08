import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  GraduationCap,
  IndianRupee,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { apiClient } from "../../../shared/services/apiClient";
import { getProgramDetailsPath } from "../../../shared/utils/links";
import { getMediaUrl } from "../../../shared/utils/media";

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const ProgramCard = ({ program }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const fee = formatPrice(program.discountFees || program.fees);
  const originalFee = program.discountFees ? formatPrice(program.fees) : null;
  const detailsPath = getProgramDetailsPath(program);
  const canOpenDetails = detailsPath !== "/programs";
  const thumbnailUrl = getMediaUrl(program.thumbnailUrl);

  useEffect(() => {
    if (window.Razorpay || document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return undefined;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleEnroll = async () => {
    if (!canOpenDetails) {
      return;
    }

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(detailsPath)}`);
      return;
    }

    try {
      setEnrolling(true);
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
        navigate(detailsPath);
      }
    } catch (_error) {
      navigate(detailsPath);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      className="card glass program-card"
    >
      <div className="program-thumb-wrap">
        {thumbnailUrl && !thumbnailError ? (
          <img
            src={thumbnailUrl}
            alt={program.title}
            className="program-thumb"
            onError={() => setThumbnailError(true)}
          />
        ) : (
          <div className="program-thumb program-thumb-placeholder">
            <GraduationCap size={28} />
          </div>
        )}
      </div>
      <div className="program-top">
        <span className="program-badge">{program.category || program.level}</span>
        {program.specialisation?.name ? <span className="meta-pill">{program.specialisation.name}</span> : null}
        {program.isFeatured ? <span className="meta-pill">Featured</span> : null}
      </div>
      <h3>{program.title}</h3>
      <p>{program.shortDescription || program.description}</p>
      <div className="program-meta">
        <span className="meta-pill">
          <Clock3 size={12} /> {program.duration}
        </span>
        <span className="meta-pill">
          <Sparkles size={12} /> {program.level}
        </span>
        <span className="meta-pill">
          <IndianRupee size={12} /> {fee || "Contact for fees"}
        </span>
      </div>
      <div className="program-meta">
        <span className="meta-pill">
          <Users size={12} /> {program.projectsCount || 0} Projects
        </span>
        <span className="meta-pill">
          <BadgeCheck size={12} /> {program.certificateIncluded ? "Certificate" : "No certificate"}
        </span>
        {originalFee ? (
          <span className="meta-pill muted-price">{originalFee}</span>
        ) : null}
      </div>
      <div className="program-meta">
        <span className="meta-pill">{program.mode}</span>
        <span className="meta-pill">
          {program.internshipSupport ? "Internship support" : "No internship support"}
        </span>
      </div>
      <div className="program-card-actions">
        <Link
          to={canOpenDetails ? detailsPath : "#"}
          className="btn btn-secondary"
          aria-disabled={!canOpenDetails}
        >
          View Details <ArrowRight size={16} />
        </Link>
        <button
          type="button"
          onClick={handleEnroll}
          className="btn btn-primary"
          disabled={enrolling || !program.id}
        >
          {enrolling ? "Enrolling..." : "Enroll Now"}
        </button>
      </div>
    </motion.article>
  );
};

export default ProgramCard;
