import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { campaignService } from "../services/campaignService";
import { getMediaUrl, normalizeStoredMediaUrl } from "../../../shared/utils/media";
import { isExternalLink, normalizeAppLink } from "../../../shared/utils/links";

const storageKey = (campaign) => `technosthan_campaign_${campaign.id}`;
const getLocalDateKey = () => new Date().toLocaleDateString("en-CA");

const isPublicPage = (pathname) => !pathname.startsWith("/admin") && !pathname.startsWith("/dashboard");

const isAllowedByFrequency = (campaign) => {
  const frequency = String(campaign.frequency || "SESSION").toUpperCase();
  const key = storageKey(campaign);

  if (frequency === "VISIT") return true;
  if (frequency === "SESSION") {
    return !sessionStorage.getItem(key);
  }
  if (frequency === "DAY") {
    const today = getLocalDateKey();
    return localStorage.getItem(key) !== today;
  }

  return true;
};

const markSeen = (campaign) => {
  const key = storageKey(campaign);
  const frequency = String(campaign.frequency || "SESSION").toUpperCase();
  if (frequency === "SESSION") sessionStorage.setItem(key, "seen");
  if (frequency === "DAY") localStorage.setItem(key, getLocalDateKey());
};

const matchesPage = (campaign, pathname) => {
  const scope = String(campaign.displayPages || "ALL").toUpperCase();
  const normalizedPath = String(pathname || "/");

  if (scope === "ALL") return true;
  if (scope === "HOME") return normalizedPath === "/";
  if (scope === "PROGRAMS") return normalizedPath.startsWith("/programs") || normalizedPath.startsWith("/skill-programs");
  if (scope === "CONTACT") return normalizedPath.startsWith("/contact");
  return true;
};

const CampaignPopup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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
        const activeCampaign = response.campaign || null;
        if (!activeCampaign) {
          hide();
          return;
        }

        const now = new Date();
        if (activeCampaign.startDate && new Date(activeCampaign.startDate) > now) {
          hide();
          return;
        }

        if (activeCampaign.endDate && new Date(activeCampaign.endDate) < now) {
          hide();
          return;
        }

        if (!matchesPage(activeCampaign, location.pathname)) {
          hide();
          return;
        }

        if (!isAllowedByFrequency(activeCampaign)) {
          hide();
          return;
        }

        setCampaign({
          ...activeCampaign,
          mediaUrl: normalizeStoredMediaUrl(activeCampaign.mediaUrl, activeCampaign.mediaType === "VIDEO" ? "video" : "image"),
        });
        setVisible(true);
        markSeen(activeCampaign);
      } catch (_error) {
        hide();
      }
    };

    load();
  }, [location.pathname]);

  const ctaLink = useMemo(() => normalizeAppLink(campaign?.ctaLink, ""), [campaign]);
  const isExternal = isExternalLink(ctaLink);
  const mediaType = String(campaign?.mediaType || "IMAGE").toUpperCase();
  const mediaUrl = getMediaUrl(campaign?.mediaUrl, mediaType === "VIDEO" ? "video" : "image");
  const popupSizeClass = `campaign-${String(campaign?.popupSize || "MEDIUM").toLowerCase()}`;

  const close = () => setVisible(false);

  const openCampaign = () => {
    if (!ctaLink) return;
    if (isExternal) {
      window.open(ctaLink, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(ctaLink);
  };

  return (
    <AnimatePresence>
      {visible && campaign ? (
        <div className="campaign-overlay" role="dialog" aria-modal="true" onClick={close}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`campaign-modal ${popupSizeClass}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="campaign-close" type="button" onClick={close} aria-label="Close campaign">
              <X size={18} />
            </button>

            <div className="campaign-body">
              <div
                className={`campaign-media-shell ${ctaLink ? "is-clickable" : ""}`}
                role={ctaLink ? "button" : undefined}
                tabIndex={ctaLink ? 0 : undefined}
                onClick={ctaLink ? openCampaign : undefined}
                onKeyDown={
                  ctaLink
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openCampaign();
                        }
                      }
                    : undefined
                }
              >
                {mediaType === "VIDEO" ? (
                  <video className="campaign-popup-media" autoPlay muted controls playsInline loop>
                    <source src={mediaUrl} />
                  </video>
                ) : (
                  <img className="campaign-popup-media" src={mediaUrl} alt={campaign.title} />
                )}
              </div>

              <div className="campaign-copy">
                <p className="badge">Campaign</p>
                <h3>{campaign.title}</h3>
                <p className="muted-copy">
                  {campaign.displayPages === "ALL" ? "Visible on all public pages" : `Visible on ${String(campaign.displayPages).toLowerCase()}`}
                </p>
                {ctaLink ? (
                  isExternal ? (
                    <a className="btn btn-primary" href={ctaLink} onClick={close}>
                      Explore now
                    </a>
                  ) : (
                    <Link className="btn btn-primary" to={ctaLink} onClick={close}>
                      Explore now
                    </Link>
                  )
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default CampaignPopup;
