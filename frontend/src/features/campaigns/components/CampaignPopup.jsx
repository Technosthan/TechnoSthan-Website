import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { campaignService } from "../services/campaignService";
import { isExternalLink, normalizeAppLink } from "../../../shared/utils/links";
import { getMediaUrl } from "../../../shared/utils/media";

const storageKey = (campaign) => `technosthan_campaign_${campaign.id}`;

const matchesPage = (campaign, pathname) => {
  if (!campaign) return false;
  const scope = String(campaign.displayPages || "ALL").toUpperCase();
  if (scope === "ALL") return true;
  if (scope === "HOME") return pathname === "/";
  if (scope === "PROGRAMS") return pathname.startsWith("/programs") || pathname === "/skill-programs";
  if (scope === "CONTACT") return pathname.startsWith("/contact");
  return true;
};

const isAllowedByFrequency = (campaign) => {
  const frequency = String(campaign.frequency || "SESSION").toUpperCase();
  const key = storageKey(campaign);
  if (frequency === "VISIT") return true;
  if (frequency === "SESSION") {
    return !sessionStorage.getItem(key);
  }
  if (frequency === "DAY") {
    const today = new Date().toISOString().slice(0, 10);
    return localStorage.getItem(key) !== today;
  }
  return true;
};

const markSeen = (campaign) => {
  const key = storageKey(campaign);
  const frequency = String(campaign.frequency || "SESSION").toUpperCase();
  if (frequency === "SESSION") sessionStorage.setItem(key, "seen");
  if (frequency === "DAY") localStorage.setItem(key, new Date().toISOString().slice(0, 10));
};

const CampaignPopup = () => {
  const location = useLocation();
  const [campaign, setCampaign] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      const hide = () => {
        setVisible(false);
        setCampaign(null);
      };

      try {
        if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/dashboard")) {
          hide();
          return;
        }
        const response = await campaignService.getActive();
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
        setCampaign(activeCampaign);
        setVisible(true);
        markSeen(activeCampaign);
      } catch (_error) {
        hide();
      }
    };

    load();
  }, [location.pathname]);

  const ctaLink = useMemo(() => normalizeAppLink(campaign?.ctaLink, "/contact"), [campaign]);
  const isExternal = isExternalLink(ctaLink);

  if (!visible || !campaign) return null;

  const isVideo = String(campaign.mediaType || "").toUpperCase() === "VIDEO";
  const mediaUrl = getMediaUrl(campaign.mediaUrl, isVideo ? "video" : "image");

  return (
    <div className="campaign-overlay" role="dialog" aria-modal="true">
      <div className={`campaign-modal campaign-${String(campaign.popupSize || "MEDIUM").toLowerCase()}`}>
        <button className="campaign-close" type="button" onClick={() => setVisible(false)} aria-label="Close campaign">
          <X size={18} />
        </button>
        <div className="campaign-body">
          {isVideo ? (
            <video className="campaign-media" autoPlay muted controls playsInline loop>
              <source src={mediaUrl} />
            </video>
          ) : (
            <img className="campaign-media" src={mediaUrl} alt={campaign.title} />
          )}
          <div className="campaign-copy">
            <p className="badge">Campaign</p>
            <h3>{campaign.title}</h3>
            {ctaLink ? (
              isExternal ? (
                <a className="btn btn-primary" href={ctaLink} onClick={() => setVisible(false)}>
                  Explore now
                </a>
              ) : (
                <Link className="btn btn-primary" to={ctaLink} onClick={() => setVisible(false)}>
                  Explore now
                </Link>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPopup;
