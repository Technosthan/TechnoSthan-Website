import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiStar,
  FiUser,
  FiMessageSquare,
} from "react-icons/fi";
import "./testimonials.css";
import { getTestimonials } from "../../../api/testimonials.api";
import { getSafeImageUrl } from "../../../shared/utils";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getTestimonials();
        setTestimonials(response.data?.data || []);
      } catch (err) {
        setTestimonials([]);
        setError(
          err?.response?.data?.message ||
            "We could not load testimonials right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="testimonials-section">
      <div className="section-header testimonials-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Client Stories
        </span>
        <h2>Trusted by Leaders Who Need Reliable Delivery</h2>
        <p>
          Real feedback from teams that rely on Technosthan for dependable
          software delivery, cloud execution, and long-term technical support.
        </p>
      </div>

      {loading ? (
        <div className="testimonials-state">Loading testimonials...</div>
      ) : error ? (
        <div className="testimonials-state error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      ) : (
        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <article key={item.id} className="testimonial-card">
              <div className="testimonial-top">
                <div className="testimonial-badge">
                  <FiMessageSquare size={16} />
                  Enterprise feedback
                </div>
                <div className="testimonial-rating" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar key={index} size={14} />
                  ))}
                </div>
              </div>

              <p className="testimonial-copy">{item.feedback}</p>

              <div className="testimonial-footer">
                <div className="testimonial-avatar">
                  {item.imageUrl ? (
                    <img
                      src={getSafeImageUrl(item.imageUrl)}
                      alt={item.clientName}
                    />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <div className="testimonial-meta">
                  <h3>{item.clientName}</h3>
                  <span>
                    {[item.designation, item.company]
                      .filter(Boolean)
                      .join(" | ")}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
