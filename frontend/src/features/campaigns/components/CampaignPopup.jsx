import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { campaignService } from "../services/campaignService";
import {
  getMediaUrl,
  normalizeStoredMediaUrl,
} from "../../../shared/utils/media";
import { isExternalLink, normalizeAppLink } from "../../../shared/utils/links";

const isPublicPage = (pathname) =>
  !pathname.startsWith("/admin") && !pathname.startsWith("/dashboard");

const CampaignPopup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [visible, setVisible] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    setVisible(false);
    setCampaign(null);

    const load = async () => {
      const hide = () => {
        setVisible(false);
        setCampaign(null);
      };

      try {
        if (!isPublicPage(location.pathname)) {
          hide();
          return;
        }

        const response = await campaignService.getActive(location.pathname);
        if (requestId !== requestIdRef.current) {
          return;
        }

        const activeCampaign = response.campaign || null;
        if (!activeCampaign) {
          hide();
          return;
        }

        setCampaign({
          ...activeCampaign,
          mediaUrl: normalizeStoredMediaUrl(
            activeCampaign.mediaUrl,
            activeCampaign.mediaType === "VIDEO" ? "video" : "image",
          ),
        });
        setVisible(true);
      } catch (_error) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        hide();
      }
    };

    load();
  }, [location.pathname]);

  const ctaLink = useMemo(
    () => normalizeAppLink(campaign?.ctaLink, ""),
    [campaign],
  );
  const isExternal = isExternalLink(ctaLink);
  const buttonText = campaign?.buttonText?.trim() || "";
  const redirectUrl = campaign?.redirectUrl?.trim() || "";
  const showCtaButton = buttonText && redirectUrl;
  const isButtonExternal = isExternalLink(redirectUrl);

  const buttonText2 = campaign?.buttonText2?.trim() || "";
  const redirectUrl2 = campaign?.redirectUrl2?.trim() || "";
  const showCtaButton2 = buttonText2 && redirectUrl2;
  const isButtonExternal2 = isExternalLink(redirectUrl2);

  const mediaType = String(campaign?.mediaType || "IMAGE").toUpperCase();
  const mediaUrl = getMediaUrl(
    campaign?.mediaUrl,
    mediaType === "VIDEO" ? "video" : "image",
  );
  const popupSizeClass = `campaign-${String(campaign?.popupSize || "MEDIUM").toLowerCase()}`;

  const closeAndReset = () => {
    setVisible(false);
    setCampaign(null);
  };

  const openCampaign = () => {
    if (!ctaLink) return;
    if (isExternal) {
      window.open(ctaLink, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(ctaLink);
  };

  const handleCtaButtonClick = (e, buttonNum = 1) => {
    e.stopPropagation();
    const url = buttonNum === 2 ? redirectUrl2 : redirectUrl;
    const isButtonExt = buttonNum === 2 ? isButtonExternal2 : isButtonExternal;

    if (!url) return;

    if (isButtonExt) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(url);
  };

  if (!visible || !campaign || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="campaign-overlay"
      role="dialog"
      aria-modal="true"
      onClick={closeAndReset}
    >
      <div
        className={`campaign-modal ${popupSizeClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="campaign-close"
          type="button"
          onClick={closeAndReset}
          aria-label="Close campaign"
        >
          <X size={18} />
        </button>

        <button
          className={`campaign-media-shell ${ctaLink ? "is-clickable" : ""}`}
          type="button"
          aria-label={
            ctaLink ? `Open campaign ${campaign.title}` : campaign.title
          }
          onClick={ctaLink ? openCampaign : undefined}
        >
          {mediaType === "VIDEO" ? (
            <video
              className="campaign-popup-media"
              autoPlay
              muted
              controls
              playsInline
              loop
            >
              <source src={mediaUrl} />
            </video>
          ) : (
            <img
              className="campaign-popup-media"
              src={mediaUrl}
              alt={campaign.title}
            />
          )}
        </button>

        {(showCtaButton || showCtaButton2) && (
          <div className="campaign-cta-button-container">
            {showCtaButton && (
              <button
                className="campaign-cta-button"
                type="button"
                onClick={(e) => handleCtaButtonClick(e, 1)}
                aria-label={buttonText}
              >
                {buttonText}
              </button>
            )}
            {showCtaButton2 && (
              <button
                className="campaign-cta-button"
                type="button"
                onClick={(e) => handleCtaButtonClick(e, 2)}
                aria-label={buttonText2}
              >
                {buttonText2}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CampaignPopup;
