import React, { useEffect, useState } from "react";
import "./Hero.css";
import { Link } from "react-router-dom";

const services = [
  {
    name: "TECHNOSTHAN HOSPITALITY",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3840&q=80",
    alt: "Luxury hotel and hospitality management systems by TechnoSthan"
  },
  {
    name: "TECHNOSTHAN INNOVATIONS HUB",
    img: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3840&q=80",
    alt: "Product innovation and custom app development by TechnoSthan"
  },
  {
    name: "TECHNOSTHAN AGRITECH",
    img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3840&q=80",
    alt: "Agri-tech solutions and farm automation by TechnoSthan"
  },
  {
    name: "TECHNOSTHAN IT SERVICES",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3840&q=80",
    alt: "Enterprise IT support and cloud engineering by TechnoSthan"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = services.length;

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 3000);

    return () => clearInterval(timer);
  }, [slideCount, isPaused]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goPrev = () => {
    setCurrentSlide((prev) => (prev + slideCount - 1) % slideCount);
  };

  const goNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  return (
    <section className="hero">

      {/* BACKGROUND LIGHT EFFECT */}
      <div className="hero-light"></div>

      {/* IMAGE SLIDER */}
      <div
        className="hero-slider"
        aria-label="Service image slider"
        role="region"
        aria-live="polite"
        aria-roledescription="carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {services.map((item, index) => (
          <article
            className={`slide ${index === currentSlide ? "active" : ""}`}
            key={item.name}
            aria-hidden={index !== currentSlide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${item.name} slide ${index + 1} of ${slideCount}`}
          >
            <img
              src={item.img}
              alt={item.alt}
              loading={index === currentSlide ? "eager" : "lazy"}
              decoding="async"
              width="1920"
              height="1080"
            />
            <div className="slide-caption">
              <span>{item.name}</span>
            </div>
          </article>
        ))}

        <div className="slider-controls">
          <button type="button" className="slider-btn prev" onClick={goPrev} aria-label="Previous slide">
            ‹
          </button>
          <button type="button" className="slider-btn next" onClick={goNext} aria-label="Next slide">
            ›
          </button>
        </div>

        <div className="slider-dots">
          {services.map((item, index) => (
            <button
              key={item.name}
              type="button"
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Show ${item.name}`}
              aria-pressed={index === currentSlide}
            />
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="hero-content">
        <h1 className="hero-title neon-text">Innovation Tomorrow.</h1>

        <h2 className="hero-subtitle gradient-text">Building Digital Excellence</h2>

        <p className="hero-description">
  TechnoSthan operates across multiple powerful business verticals 
  Innovations Hub, Hospitality, Agritech, and Information & Technology Services 
  delivering diverse solutions that drive growth, innovation, and digital transformation.
</p>

        <div className="hero-buttons">
          <Link to="/services" className="btn primary">
            Business Verticals
          </Link>

          <Link to="/about" className="btn secondary">
            About Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;  