import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMessageSquare,
  FiStar,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { getSafeImageUrl } from "../../../shared/utils";

const clampIndex = (index, length) => {
  if (!length) {
    return 0;
  }

  return ((index % length) + length) % length;
};

const getInitials = (name) =>
  String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2) || "TS";

const getRatingValue = (item) => {
  const rating = Number(item?.rating ?? item?.stars ?? item?.score);
  return Number.isFinite(rating) ? rating : null;
};

const truncate = (value, limit = 92) => {
  const text = String(value || "").trim();
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}...`;
};

const EditorialTestimonials = ({ testimonials = [] }) => {
  const scopeRef = useRef(null);
  const featureRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonialCount = testimonials.length;
  const activeIndexSafe = testimonialCount
    ? clampIndex(activeIndex, testimonialCount)
    : 0;

  const activeItem = useMemo(
    () => testimonials[activeIndexSafe] || null,
    [activeIndexSafe, testimonials]
  );

  const neighboringItems = useMemo(() => {
    if (testimonialCount <= 1) {
      return [];
    }

    const previousIndex = clampIndex(activeIndexSafe - 1, testimonialCount);
    const nextIndex = clampIndex(activeIndexSafe + 1, testimonialCount);
    const uniqueIndexes = [previousIndex, nextIndex].filter(
      (index, current, array) => array.indexOf(index) === current
    );

    return uniqueIndexes.map((index) => ({
      index,
      item: testimonials[index],
    }));
  }, [activeIndexSafe, testimonialCount, testimonials]);

  useEffect(() => {
    if (!testimonialCount) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex >= testimonialCount) {
      setActiveIndex(0);
    }
  }, [activeIndex, testimonialCount]);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return undefined;
      }

      const targets = scopeRef.current.querySelectorAll(
        "[data-testimonial-reveal]"
      );

      if (!targets.length) {
        return undefined;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.07,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    { scope: scopeRef, dependencies: [reducedMotion, testimonialCount] }
  );

  useEffect(() => {
    if (reducedMotion || !featureRef.current || !activeItem) {
      return undefined;
    }

    const context = gsap.context(() => {
      const targets = featureRef.current.querySelectorAll(
        "[data-testimonial-animate]"
      );

      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.04,
          ease: "power2.out",
          overwrite: "auto",
        }
      );
    }, featureRef);

    return () => context.revert();
  }, [activeIndexSafe, activeItem, reducedMotion]);

  if (!activeItem) {
    return null;
  }

  const ratingValue = getRatingValue(activeItem);
  const hasRating = ratingValue !== null && ratingValue > 0;
  const ratingFilled = hasRating ? Math.min(5, Math.round(ratingValue)) : 0;
  const activeImageUrl = activeItem.imageUrl
    ? getSafeImageUrl(activeItem.imageUrl)
    : "";
  const activeInitials = getInitials(activeItem.clientName);
  const activeMeta = [activeItem.designation, activeItem.company]
    .filter(Boolean)
    .join(activeItem.designation && activeItem.company ? " | " : "");
  const progressValue = ((activeIndexSafe + 1) / testimonialCount) * 100;
  const stepLabel = `Testimonial ${String(activeIndexSafe + 1).padStart(
    2,
    "0"
  )} of ${String(testimonialCount).padStart(2, "0")}`;

  const goToIndex = (nextIndex) => {
    if (!testimonialCount) {
      return;
    }

    setActiveIndex(clampIndex(nextIndex, testimonialCount));
  };

  const changeSlide = (direction) => {
    if (!testimonialCount) {
      return;
    }

    setActiveIndex((current) => {
      const nextValue = direction === "next" ? current + 1 : current - 1;
      return clampIndex(nextValue, testimonialCount);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      changeSlide("prev");
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      changeSlide("next");
    }

    if (event.key === "Home") {
      event.preventDefault();
      goToIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      goToIndex(testimonialCount - 1);
    }
  };

  return (
    <section
      className="editorial-testimonials"
      ref={scopeRef}
      data-motion-zone="testimonials"
      aria-labelledby="client-voices-heading"
    >
      <div className="editorial-shell editorial-testimonials-shell">
        <header className="editorial-testimonials-header" data-testimonial-reveal>
          <span className="editorial-testimonials-eyebrow">CLIENT VOICES</span>
          <h2 id="client-voices-heading">
            Trusted by teams building what comes next.
          </h2>
          <p>
            Real feedback from teams that rely on Technosthan for dependable
            software delivery, cloud execution, and long-term technical support.
          </p>
        </header>

        <div
          className="editorial-testimonials-layout"
          role="group"
          aria-label="Client testimonials"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="editorial-testimonials-feature-wrap">
            <article
              className="editorial-testimonials-feature"
              ref={featureRef}
              aria-live="polite"
              aria-atomic="true"
            >
              <div
                className="editorial-testimonials-feature-head"
                data-testimonial-animate
              >
                <span className="editorial-testimonials-step">{stepLabel}</span>
                <span className="editorial-testimonials-chip">Client voice</span>
              </div>

              <blockquote
                className="editorial-testimonials-quote"
                data-testimonial-animate
              >
                <FiMessageSquare
                  size={26}
                  className="editorial-testimonials-quote-icon"
                  aria-hidden="true"
                />
                <p>{activeItem.feedback}</p>
              </blockquote>

              <div
                className="editorial-testimonials-attribution"
                data-testimonial-animate
              >
                <div className="editorial-testimonials-avatar">
                  {activeImageUrl ? (
                    <img
                      src={activeImageUrl}
                      alt={activeItem.clientName}
                      loading="lazy"
                      decoding="async"
                      width="112"
                      height="112"
                    />
                  ) : (
                    <span aria-hidden="true">{activeInitials}</span>
                  )}
                </div>

                <div className="editorial-testimonials-person">
                  <h3>{activeItem.clientName}</h3>
                  {activeMeta ? <p>{activeMeta}</p> : null}
                </div>

                {hasRating ? (
                  <div
                    className="editorial-testimonials-rating"
                    aria-label={`${ratingValue.toFixed(1)} out of 5 stars`}
                  >
                    <span className="sr-only">
                      {ratingValue.toFixed(1)} out of 5 stars
                    </span>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FiStar
                        key={`rating-star-${index}`}
                        size={14}
                        className={index < ratingFilled ? "is-filled" : "is-muted"}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              <div
                className="editorial-testimonials-controls"
                data-testimonial-animate
              >
                <div className="editorial-testimonials-progress" aria-hidden="true">
                  <span style={{ width: `${progressValue}%` }} />
                </div>

                <div className="editorial-testimonials-index">
                  <strong>{String(activeIndexSafe + 1).padStart(2, "0")}</strong>
                  <span>
                    {" "}
                    / {String(testimonialCount).padStart(2, "0")}
                  </span>
                </div>

                <div className="editorial-testimonials-nav">
                  <button
                    type="button"
                    className="editorial-testimonials-nav-btn"
                    onClick={() => changeSlide("prev")}
                    aria-label="Previous testimonial"
                  >
                    <FiChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="editorial-testimonials-nav-btn"
                    onClick={() => changeSlide("next")}
                    aria-label="Next testimonial"
                  >
                    <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          </div>

          {neighboringItems.length > 0 ? (
            <aside
              className="editorial-testimonials-rail"
              aria-label="Other client voices"
            >
              {neighboringItems.map(({ index, item }) => {
                const imageUrl = item.imageUrl ? getSafeImageUrl(item.imageUrl) : "";
                const initials = getInitials(item.clientName);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="editorial-testimonials-preview"
                    onClick={() => goToIndex(index)}
                    aria-label={`Show testimonial from ${item.clientName}`}
                  >
                    <div className="editorial-testimonials-preview-avatar">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          decoding="async"
                          width="64"
                          height="64"
                        />
                      ) : (
                        <span aria-hidden="true">{initials}</span>
                      )}
                    </div>
                    <div className="editorial-testimonials-preview-copy">
                      <span className="editorial-testimonials-preview-name">
                        {item.clientName}
                      </span>
                      <span className="editorial-testimonials-preview-meta">
                        {[item.designation, item.company].filter(Boolean).join(
                          item.designation && item.company ? " | " : ""
                        )}
                      </span>
                      <p>{truncate(item.feedback)}</p>
                    </div>
                  </button>
                );
              })}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default EditorialTestimonials;
