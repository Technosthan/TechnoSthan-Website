import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "react-icons/fa";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaTimes
} from "react-icons/fa";
import "./HRSocial.css";

const defaultSocials = [
  { id: 1, name: "Facebook", icon: "FaFacebookF", color: "#1877F2" },
  { id: 2, name: "Instagram", icon: "FaInstagram", color: "#E4405F" }
];

const defaultTemplates = [
  { id: "t1", text: "Hiring Now!" },
  { id: "t2", text: "New Launch" }
];

const HRSocial = () => {
  const scrollRef = useRef(null);

  const [availableSocials, setAvailableSocials] = useState(
    JSON.parse(localStorage.getItem("socials")) || defaultSocials
  );

  const [templates, setTemplates] = useState(
    JSON.parse(localStorage.getItem("templates")) || defaultTemplates
  );

  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [messageItems, setMessageItems] = useState([]);

  useEffect(() => {
    localStorage.setItem("socials", JSON.stringify(availableSocials));
  }, [availableSocials]);

  useEffect(() => {
    localStorage.setItem("templates", JSON.stringify(templates));
  }, [templates]);

  /* ===== ADD TEXT TO BOX (ANIMATED) ===== */
  const addMessageText = (text) => {
    setMessageItems([
      ...messageItems,
      { id: Date.now(), text }
    ]);
  };

  /* ===== SELECT PLATFORM (ANIMATED DROP) ===== */
  const selectPlatform = (platform) => {
    if (!selectedPlatforms.find((p) => p.id === platform.id)) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
      setAvailableSocials(
        availableSocials.filter((s) => s.id !== platform.id)
      );
    }
  };

  const removePlatform = (platform) => {
    setAvailableSocials([...availableSocials, platform]);
    setSelectedPlatforms(
      selectedPlatforms.filter((p) => p.id !== platform.id)
    );
  };

  /* ===== ADD NEW ===== */
  const addPlatform = () => {
    const name = prompt("Platform name?");
    const color = prompt("Color hex?");
    const icon = prompt("Icon name (FaFacebookF)");

    if (!name || !icon) return;

    setAvailableSocials([
      ...availableSocials,
      { id: Date.now(), name, icon, color: color || "#333" }
    ]);
  };

  const addTemplate = () => {
    const text = prompt("Template text?");
    if (!text) return;
    setTemplates([...templates, { id: Date.now(), text }]);
  };

  const removeTemplate = (id) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft += dir === "left" ? -120 : 120;
  };

  return (
    <div className="main-container-wrapper">
      <div className="unified-glass-card">

        {/* ===== MESSAGE BUILDER ===== */}
        <div className="inner-box border-bottom">
          <div className="box-header">
            <h4>💬 Message Builder</h4>
          </div>

          <div className="slider-control">
            <button className="arrow-btn" onClick={() => scroll("left")}>
              <FaChevronLeft />
            </button>

            <div className="icon-track" ref={scrollRef}>
              <div className="add-bubble" onClick={addTemplate}>
                <FaPlus />
              </div>

              {templates.map((t, i) => (
                <div key={t.id} className="bubble-wrapper">
                  <div
                    className="mini-bubble"
                    onClick={() => addMessageText(t.text)}
                  >
                    {i + 1}
                  </div>

                  <span className="hover-message">{t.text}</span>

                  <FaTimes
                    className="remove-template"
                    onClick={() => removeTemplate(t.id)}
                  />
                </div>
              ))}
            </div>

            <button className="arrow-btn" onClick={() => scroll("right")}>
              <FaChevronRight />
            </button>
          </div>

          {/* MESSAGE BOX WITH DROP ANIMATION */}
          <div className="message-box">
            <AnimatePresence>
              {messageItems.map((m) => (
                <motion.span
                  key={m.id}
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="message-chip"
                >
                  {m.text}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ===== PLATFORM BUILDER ===== */}
        <div className="inner-box">
          <div className="box-header">
            <h4>🎯 Target Platforms</h4>
          </div>

          <div className="slider-control">
            <button className="arrow-btn" onClick={() => scroll("left")}>
              <FaChevronLeft />
            </button>

            <div className="icon-track" ref={scrollRef}>
              <div className="social-unit add-bubble" onClick={addPlatform}>
                <FaPlus />
              </div>

              {availableSocials.map((s) => {
                const Icon = Icons[s.icon] || Icons.FaCode;

                return (
                  <div
                    key={s.id}
                    className="social-unit"
                    style={{ backgroundColor: s.color }}
                    onClick={() => selectPlatform(s)}
                  >
                    <Icon />
                  </div>
                );
              })}
            </div>

            <button className="arrow-btn" onClick={() => scroll("right")}>
              <FaChevronRight />
            </button>
          </div>

          {/* DROP BOX */}
          <div className="drop-preview">
            <AnimatePresence>
              {selectedPlatforms.map((s) => {
                const Icon = Icons[s.icon] || Icons.FaCode;

                return (
                  <motion.div
                    key={s.id}
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ scale: 0 }}
                    className="mini-target"
                    style={{ background: s.color }}
                    onClick={() => removePlatform(s)}
                  >
                    <Icon />
                    <div className="remove-overlay">
                      <FaTimes size={8} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {selectedPlatforms.length === 0 && (
              <span className="hint">Click icon to add</span>
            )}
          </div>

          {/* BUTTONS */}
          <div className="final-actions">
            <button className="btn-ui secondary">Save</button>
            <button className="btn-ui primary">Submit</button>
            <button className="btn-ui full">Save & Submit</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HRSocial;