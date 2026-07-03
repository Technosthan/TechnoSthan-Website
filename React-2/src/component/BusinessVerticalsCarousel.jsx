import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { motion } from "framer-motion";
import {
  DEFAULT_BUSINESS_VERTICALS,
  DEFAULT_VERTICAL_IMAGE_MAP,
} from "../lib/businessVerticalDefaults";
import "./BusinessVerticalsCarousel.css";

const mapVertical = (item) => {
  const imageUrl =
    DEFAULT_VERTICAL_IMAGE_MAP[item.imageUrl] || item.imageUrl || "";

  return {
    ...item,
    imageUrl,
  };
};

const BusinessVerticalsCarousel = () => {
  const [verticals, setVerticals] = useState(DEFAULT_BUSINESS_VERTICALS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data } = await api.get("/api/business-verticals");
        if (active && data?.success && Array.isArray(data.data)) {
          const items = data.data.map(mapVertical);
          setVerticals(items);
        }
      } catch (err) {
        console.error("Failed to load business verticals", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const loopedItems = useMemo(() => [...verticals, ...verticals], [verticals]);

  return (
    <section className="business-verticals-carousel">
      <div className="business-verticals-heading">
        <h1>Our Business Verticals</h1>
        <p>
          Four flagship offerings that power TechnoSthan, plus any custom
          verticals added from the admin panel.
        </p>
      </div>

      <div className="carousel-viewport">
        <div className={`carousel-track ${loading ? "carousel-loading" : ""}`}>
          {loopedItems.map((vertical, index) => (
            <motion.a
              key={`${vertical._id}-${index}`}
              className="carousel-card"
              href={vertical.path || "#"}
              target={vertical.path?.startsWith("http") ? "_blank" : "_self"}
              rel={vertical.path?.startsWith("http") ? "noreferrer" : undefined}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <div className="carousel-card__logo">
                <img src={vertical.imageUrl} alt={vertical.title} />
              </div>
              <div className="carousel-card__content">
                <h3>{vertical.title}</h3>
                <p>{vertical.description}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessVerticalsCarousel;
