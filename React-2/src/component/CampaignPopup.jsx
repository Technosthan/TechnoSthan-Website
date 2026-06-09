import React, { useEffect, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import api from "../lib/api";
import "./CampaignPopup.css";

const CampaignPopup = () => {
  const [campaign, setCampaign] = useState(null);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { data } = await api.get("/api/campaigns/active");
        if (data.success && data.data) {
          setCampaign(data.data);
          setOpen(true);
        }
      } catch (err) {
        console.error("Failed to load campaign popup", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && open) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  if (!campaign || !open) {
    return null;
  }

  return (
    <div className="campaign-popup__overlay" onClick={handleOverlayClick}>
      <div
        className="campaign-popup__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Promotional campaign"
      >
        <button
          className="campaign-popup__close"
          onClick={handleClose}
          aria-label="Close campaign popup"
        >
          <X size={20} />
        </button>

        <div className="campaign-popup__content">
          <div className="campaign-popup__media">
            {campaign.mediaType === "video" ? (
              <video
                src={campaign.mediaUrl}
                autoPlay
                muted={muted}
                playsInline
                loop
                controls
                className="campaign-popup__video"
              />
            ) : (
              <img
                src={campaign.mediaUrl}
                alt="Campaign promotion"
                className="campaign-popup__image"
              />
            )}
          </div>

          {}
        </div>
      </div>
    </div>
  );
};

export default CampaignPopup;
