import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../lib/api";
import "./CampaignPopup.css";

const CampaignPopup = () => {
  const [campaign, setCampaign] = useState(null);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);

  const fetchCampaign = async () => {
    try {
      const { data } = await api.get("/api/campaigns/active");
      if (data.success && data.data) {
        setCampaign(data.data);
      } else {
        setCampaign(null);
        setOpen(false);
      }
    } catch (err) {
      console.error("Failed to load campaign popup", err);
      setCampaign(null);
      setOpen(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, []);

  useEffect(() => {
    if (!campaign) {
      setOpen(false);
      return undefined;
    }

    const startAt = campaign.startAt ? new Date(campaign.startAt).getTime() : null;
    const expiresAt = campaign.expiresAt ? new Date(campaign.expiresAt).getTime() : null;
    const now = Date.now();
    let openTimer = null;
    let expireTimer = null;

    if (startAt && startAt > now) {
      setOpen(false);
      openTimer = window.setTimeout(() => {
        setOpen(true);
      }, startAt - now);

      if (expiresAt && expiresAt > startAt) {
        expireTimer = window.setTimeout(() => {
          setOpen(false);
          fetchCampaign();
        }, expiresAt - now);
      }
    } else {
      setOpen(true);

      if (expiresAt && expiresAt > now) {
        expireTimer = window.setTimeout(() => {
          setOpen(false);
          fetchCampaign();
        }, expiresAt - now);
      }
    }

    return () => {
      if (openTimer) {
        window.clearTimeout(openTimer);
      }
      if (expireTimer) {
        window.clearTimeout(expireTimer);
      }
    };
  }, [campaign]);

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

  const handleCampaignClick = () => {
    if (!campaign.redirectUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = campaign.redirectUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
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
          <div
            className="campaign-popup__media"
            onClick={handleCampaignClick}
            role={campaign.redirectUrl ? "button" : undefined}
            tabIndex={campaign.redirectUrl ? 0 : undefined}
            onKeyDown={(event) => {
              if (!campaign.redirectUrl) {
                return;
              }

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleCampaignClick();
              }
            }}
          >
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
        </div>
      </div>
    </div>
  );
};

export default CampaignPopup;
