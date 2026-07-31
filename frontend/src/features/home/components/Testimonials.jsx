import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiMessageSquare,
  FiStar,
  FiUser,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";
import "./testimonials.css";
import { getTestimonials } from "../../../api/testimonials.api";
import { getSafeImageUrl } from "../../../shared/utils";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const scopeRef = useRef(null);
  const stageRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const touchStartRef = useRef(0);

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

  useEffect(() => {
    if (!scopeRef.current || reducedMotion) {
      setIsVisible(!reducedMotion);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(scopeRef.current);

    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (!testimonials.length) {
      return;
    }

    const interval = window.setInterval(() => {
      if (reducedMotion || !isVisible || isHovered || testimonials.length < 2) {
        return;
      }

      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [isVisible, isHovered, reducedMotion, testimonials.length]);

  const activeTestimonial = useMemo(
    () => testimonials[Math.min(activeIndex, testimonials.length - 1)] || null,
    [activeIndex, testimonials]
  );

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !stageRef.current) {
        return;
      }

      gsap.fromTo(
        stageRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: scopeRef.current,
            start: "top 78%",
            once: true,
          },
        }
      );
    },
    {
      scope: scopeRef,
      dependencies: [activeIndex, reducedMotion, testimonials.length],
    }
  );

  useEffect(() => {
    if (!stageRef.current || reducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        stageRef.current.querySelectorAll("[data-testimonial-fade]"),
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.03,
        }
      );
    }, stageRef);

    return () => ctx.revert();
  }, [activeIndex, reducedMotion]);

  if (!loading && testimonials.length === 0) {
    return null;
  }

  const changeSlide = (direction) => {
    if (!testimonials.length) {
      return;
    }

    setActiveIndex((current) => {
      if (direction === "next") {
        return (current + 1) % testimonials.length;
      }

      return (current - 1 + testimonials.length) % testimonials.length;
    });
  };

  const handleTouchStart = (event) => {
    touchStartRef.current = event.touches?.[0]?.clientX || 0;
  };

  const handleTouchEnd = (event) => {
    const touchEnd = event.changedTouches?.[0]?.clientX || 0;
    const delta = touchEnd - touchStartRef.current;

    if (Math.abs(delta) < 60) {
      return;
    }

    changeSlide(delta < 0 ? "next" : "prev");
  };

  return (
    <section
      className="testimonials-section"
      ref={scopeRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="section-header testimonials-header">
        <span className="section-badge" data-testimonial-fade>
          <span className="badge-dot" />
          Client Stories
        </span>
        <h2 data-gsap="text-reveal">Trusted by leaders who expect calm execution</h2>
        <p data-testimonial-fade>
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
        <div className="testimonial-layout">
          <article
            className="testimonial-stage"
            ref={stageRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="testimonial-stage-quote" data-testimonial-fade>
              <FiMessageSquare />
            </div>

            {activeTestimonial ? (
              <div className="testimonial-stage-content">
                <p className="testimonial-copy" data-testimonial-fade>
                  “{activeTestimonial.feedback}”
                </p>

                <div className="testimonial-stage-footer" data-testimonial-fade>
                  <div className="testimonial-avatar">
                    {activeTestimonial.imageUrl ? (
                      <img
                        src={getSafeImageUrl(activeTestimonial.imageUrl)}
                        alt={activeTestimonial.clientName}
                      />
                    ) : (
                      <FiUser />
                    )}
                  </div>

                  <div className="testimonial-meta">
                    <h3>{activeTestimonial.clientName}</h3>
                    <span>
                      {[activeTestimonial.designation, activeTestimonial.company]
                        .filter(Boolean)
                        .join(" | ")}
                    </span>
                  </div>
                </div>

                <div className="testimonial-rating" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar key={index} size={14} />
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          <aside className="testimonial-controls">
            <div className="testimonial-progress" aria-hidden="true">
              <span
                style={{
                  width: `${((Math.min(activeIndex, testimonials.length - 1) + 1) / testimonials.length) * 100}%`,
                }}
              />
            </div>

            <div className="testimonial-count">
              <strong>
                {String(Math.min(activeIndex, testimonials.length - 1) + 1).padStart(2, "0")}
                <span> / {String(testimonials.length).padStart(2, "0")}</span>
              </strong>
              <p>Swipe or use the controls to explore more client stories.</p>
            </div>

            <div className="testimonial-nav">
              <button
                type="button"
                className="testimonial-nav-btn"
                onClick={() => changeSlide("prev")}
                aria-label="Previous testimonial"
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="testimonial-nav-btn"
                onClick={() => changeSlide("next")}
                aria-label="Next testimonial"
              >
                <FiChevronRight />
              </button>
            </div>

            <div className="testimonial-dots" role="tablist" aria-label="Testimonials">
              {testimonials.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === Math.min(activeIndex, testimonials.length - 1)}
                  aria-label={`Show testimonial ${index + 1}`}
                  className={`testimonial-dot ${
                    index === Math.min(activeIndex, testimonials.length - 1)
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
