import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_BUSINESS_VERTICALS } from "../lib/businessVerticalDefaults";
import socket from "../socket";
import BusinessVerticalImage from "./BusinessVerticalImage";
import {
  BUSINESS_VERTICALS_UPDATED_EVENT,
  BUSINESS_VERTICALS_UPDATED_STORAGE_KEY,
  mergeBusinessVerticals,
  resolveBusinessVerticalImageSrc,
} from "../lib/businessVerticalUtils";
import "./BusinessVerticalsCarousel.css";

const mapVertical = (item) => ({
  ...item,
  imageUrl: resolveBusinessVerticalImageSrc(item),
});

const BusinessVerticalsCarousel = () => {
  const [verticals, setVerticals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVerticals = async (activeRef) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE || "http://localhost:5000"
        }/api/business-verticals`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        },
      );

      const data = await response.json();

      if (!activeRef.current) return;

      const apiVerticals =
        data?.success && Array.isArray(data.data)
          ? data.data
          : [];

      const finalVerticals = mergeBusinessVerticals(
        [
          ...DEFAULT_BUSINESS_VERTICALS,
          ...apiVerticals,
        ].map(mapVertical),
      );

      setVerticals(
        finalVerticals.length
          ? finalVerticals
          : DEFAULT_BUSINESS_VERTICALS.map(mapVertical),
      );
    } catch (error) {
      console.error(
        "Failed to load business verticals",
        error,
      );

      if (activeRef.current) {
        setVerticals(
          DEFAULT_BUSINESS_VERTICALS.map(mapVertical),
        );
      }
    } finally {
      if (activeRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const activeRef = { current: true };

    loadVerticals(activeRef);

    const handleRefresh = () => {
      loadVerticals(activeRef);
    };

    const handleStorageRefresh = (event) => {
      if (
        event.key ===
        BUSINESS_VERTICALS_UPDATED_STORAGE_KEY
      ) {
        loadVerticals(activeRef);
      }
    };

    socket.on(
      BUSINESS_VERTICALS_UPDATED_EVENT,
      handleRefresh,
    );

    window.addEventListener(
      BUSINESS_VERTICALS_UPDATED_EVENT,
      handleRefresh,
    );

    window.addEventListener(
      "storage",
      handleStorageRefresh,
    );

    return () => {
      activeRef.current = false;

      socket.off(
        BUSINESS_VERTICALS_UPDATED_EVENT,
        handleRefresh,
      );

      window.removeEventListener(
        BUSINESS_VERTICALS_UPDATED_EVENT,
        handleRefresh,
      );

      window.removeEventListener(
        "storage",
        handleStorageRefresh,
      );
    };
  }, []);

  const shouldAnimate = useMemo(
    () => !loading && verticals.length > 0,
    [loading, verticals.length],
  );

  const renderVerticalCard = (
    vertical,
    index,
    groupName,
  ) => {
    const stableId =
      vertical._id ||
      vertical.id ||
      vertical.slug ||
      vertical.title ||
      `vertical-${index}`;

    const isExternalLink =
      typeof vertical.path === "string" &&
      vertical.path.startsWith("http");

    return (
      <motion.a
        key={`${groupName}-${stableId}`}
        className="carousel-card"
        href={vertical.path || "#"}
        target={isExternalLink ? "_blank" : "_self"}
        rel={isExternalLink ? "noreferrer" : undefined}
        whileHover={{ y: -6 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
      >
        <BusinessVerticalImage
          vertical={vertical}
          alt={vertical.title || "Business vertical"}
          className="carousel-card__logo"
          imageClassName="carousel-card__logo-image"
        />

        <div className="carousel-card__content">
          <h3>{vertical.title}</h3>
          <p>{vertical.description}</p>
        </div>
      </motion.a>
    );
  };

  return (
    <section className="business-verticals-carousel site-container">
      <div className="business-verticals-heading">
        <h2>Our Business Verticals</h2>

        <p>
          Four flagship offerings that power TechnoSthan,
          plus any custom verticals added from the admin
          panel.
        </p>
      </div>

      <div className="carousel-viewport">
        {shouldAnimate ? (
          <div
            className="carousel-track"
            aria-busy="false"
          >
            <div className="carousel-group">
              {verticals.map((vertical, index) =>
                renderVerticalCard(
                  vertical,
                  index,
                  "first",
                ),
              )}
            </div>

            <div
              className="carousel-group"
              aria-hidden="true"
            >
              {verticals.map((vertical, index) =>
                renderVerticalCard(
                  vertical,
                  index,
                  "second",
                ),
              )}
            </div>
          </div>
        ) : (
          <div
            className="carousel-loading-space"
            aria-busy="true"
          />
        )}
      </div>
    </section>
  );
};

export default BusinessVerticalsCarousel;