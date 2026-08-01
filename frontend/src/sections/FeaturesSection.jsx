import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { getPublicHomepageServices } from "../features/homepageServices/homepageServicesApi";
import {
  getLocalizedText,
  isSafeServiceUrl,
  normalizeServiceLanguage,
} from "../features/homepageServices/homepageServices.utils";
import {
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  ChevronDown,
  ClipboardList,
  Code2,
  ExternalLink,
  Hotel,
  Leaf,
  RefreshCcw,
  Sparkles,
  Layers3,
} from "lucide-react";

const ICON_MAP = {
  Leaf,
  Sparkles,
  Code2,
  Hotel,
  Building2,
  BookOpen,
  ClipboardList,
  Bot,
  BarChart3,
  Layers3,
};

const DEFAULT_ICON = Sparkles;
const OPEN_SERVICE_IDS_STORAGE_KEY = "technosthan-homepage-open-services";

const getServiceId = (service = {}, index = 0) =>
  String(service.serviceKey || service.slug || service._id || service.id || index);

const loadOpenServiceIds = () => {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const stored = window.localStorage.getItem(OPEN_SERVICE_IDS_STORAGE_KEY);
    if (!stored) {
      return new Set();
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((value) => typeof value === "string" && value.trim()));
  } catch {
    return new Set();
  }
};

const FeaturesSection = () => {
  const { language } = useTheme();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openServiceIds, setOpenServiceIds] = useState(() => loadOpenServiceIds());

  const cardRefs = useRef(new Map());

  const activeLanguage = normalizeServiceLanguage(language || "en");

  useEffect(() => {
    let cancelled = false;

    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPublicHomepageServices();
        const nextServices = response.data?.data || [];
        if (cancelled) return;

        setServices(nextServices);
        setOpenServiceIds((current) => {
          const next = new Set();
          current.forEach((serviceId) => {
            if (nextServices.some((service, index) => getServiceId(service, index) === serviceId)) {
              next.add(serviceId);
            }
          });
          return next;
        });
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || err.message || "Failed to load services");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedServices = useMemo(
    () =>
      [...services].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [services],
  );

  const setCardRef = (serviceId) => (node) => {
    if (node) {
      cardRefs.current.set(serviceId, node);
      return;
    }

    cardRefs.current.delete(serviceId);
  };

  const iconFor = (value = "") => ICON_MAP[value] || DEFAULT_ICON;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        OPEN_SERVICE_IDS_STORAGE_KEY,
        JSON.stringify(Array.from(openServiceIds)),
      );
    } catch {}
  }, [openServiceIds]);

  useEffect(() => {
    if (openServiceIds.size === 0) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenServiceIds(new Set());
      }
    };

    const handlePointerDown = (event) => {
      const clickedCard = Array.from(cardRefs.current.values()).some((element) =>
        element.contains(event.target),
      );

      if (!clickedCard) {
        setOpenServiceIds(new Set());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [openServiceIds]);

  useEffect(() => {
    if (openServiceIds.size === 0) return;

    setOpenServiceIds((current) => {
      const next = new Set();
      current.forEach((serviceId) => {
        if (sortedServices.some((service, index) => getServiceId(service, index) === serviceId)) {
          next.add(serviceId);
        }
      });
      return next;
    });
  }, [sortedServices]);

  const toggleService = (serviceId) => {
    setOpenServiceIds((current) => {
      const next = new Set(current);

      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }

      return next;
    });
  };

  return (
    <section className="relative bg-[#07111f] px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            <Sparkles size={15} />
            {t("home.features.badge")}
          </div> */}
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            {t("home.features.title")}
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur"
              >
                <div className="h-12 w-12 rounded-2xl bg-white/10" />
                <div className="mt-5 h-6 w-2/3 rounded bg-white/10" />
                <div className="mt-3 h-4 w-full rounded bg-white/10" />
                <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100 shadow-2xl">
            <h3 className="text-lg font-bold">Services unavailable</h3>
            <p className="mt-2 text-sm text-rose-100/85">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : sortedServices.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-white shadow-2xl backdrop-blur">
            <h3 className="text-2xl font-bold">No active services yet</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The homepage stays usable while services are configured in the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid auto-rows-auto grid-cols-1 items-start gap-[22px] md:grid-cols-2">
            {sortedServices.map((service, index) => {
              const serviceId = getServiceId(service, index);
              const isSelected = openServiceIds.has(serviceId);
              const ServiceIcon = iconFor(service.icon);
              const innerServices = Array.isArray(service.innerServices) ? service.innerServices : [];

              return (
                <div
                  key={serviceId}
                  ref={setCardRef(serviceId)}
                  className={`service-card h-auto w-full min-w-0 self-start overflow-hidden rounded-[28px] border shadow-2xl backdrop-blur transition-colors duration-200 ${
                    isSelected
                      ? "service-card--expanded border-emerald-400/60 bg-slate-950 text-white"
                      : "border-white/10 bg-white/5 text-white"
                  }`}
                >
                  <button
                    id={`service-trigger-${serviceId}`}
                    type="button"
                    className="service-card-header flex w-full items-center gap-4 px-6 py-6 text-left sm:gap-4 sm:px-6 sm:py-6"
                    aria-expanded={isSelected}
                    aria-controls={`service-panel-${serviceId}`}
                    onClick={() => toggleService(serviceId)}
                  >
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                      style={{ background: service.accentColor || "#16a34a" }}
                    >
                      <ServiceIcon className="h-7 w-7" />
                    </div>

                    <div className="service-card-header-content min-w-0 flex-1 text-left">
                      <h3
                        className="text-xl font-bold leading-tight text-white"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                        }}
                      >
                        {getLocalizedText(service.name, activeLanguage)}
                      </h3>
                      <p
                        className="mt-2 text-sm leading-6 text-slate-300"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                        }}
                      >
                        {getLocalizedText(service.description, activeLanguage)}
                      </p>
                    </div>

                    <ChevronDown
                      className={`service-card-chevron chevron ml-auto h-5 w-5 shrink-0 transition ${
                        isSelected ? "rotate-180 text-emerald-300" : "text-slate-400"
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isSelected ? (
                      <motion.div
                        key={`sub-services-${serviceId}`}
                        id={`service-panel-${serviceId}`}
                        role="region"
                        aria-labelledby={`service-trigger-${serviceId}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.28, ease: "easeInOut" },
                          opacity: { duration: 0.18 },
                        }}
                        className="sub-services-animation-wrapper overflow-hidden w-full"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="sub-services-grid grid w-full grid-cols-2 gap-3 px-6 pb-6 pt-0 max-[480px]:grid-cols-1 sm:px-6 sm:pb-6 sm:pt-1">
                          {innerServices.map((inner, innerIndex) => {
                            const innerId = inner._id || inner.id || innerIndex;
                            const title =
                              getLocalizedText(inner.title, activeLanguage) || `Inner service ${innerIndex + 1}`;
                            const description = getLocalizedText(inner.description, activeLanguage);
                            const clickable = isSafeServiceUrl(inner.redirectUrl);
                            const InnerIcon = iconFor(inner.icon || service.icon);

                            const innerCard = (
                              <div className="sub-service-card group flex min-h-[76px] w-full items-center gap-3 rounded-[15px] border border-white/10 bg-white/5 px-[15px] py-[13px] transition hover:border-emerald-300/40 hover:bg-white/10">
                                <div
                                  className="sub-service-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition group-hover:scale-[1.03]"
                                  style={{ background: service.accentColor || "#16a34a" }}
                                >
                                  <InnerIcon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4
                                      className="sub-service-title text-[15px] font-semibold leading-[1.3] text-white"
                                      style={{
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 2,
                                        overflow: "hidden",
                                      }}
                                    >
                                      {title}
                                    </h4>
                                    {clickable ? (
                                      <ExternalLink className="mt-0.5 h-4 w-4 text-slate-400 transition group-hover:text-emerald-300" />
                                    ) : null}
                                  </div>
                                  {description ? (
                                    <p
                                      className="sub-service-description mt-[3px] text-xs leading-[1.35] text-slate-300"
                                      style={{
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 2,
                                        overflow: "hidden",
                                      }}
                                    >
                                      {description}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            );

                            if (!clickable) {
                              return (
                                <button
                                  key={innerId}
                                  type="button"
                                  onClick={(event) => event.stopPropagation()}
                                  className="w-full text-left"
                                >
                                  {innerCard}
                                </button>
                              );
                            }

                            return (
                              <a
                                key={innerId}
                                href={inner.redirectUrl}
                                target={inner.openInNewTab ? "_blank" : "_self"}
                                rel={inner.openInNewTab ? "noreferrer" : undefined}
                                className="block w-full"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {innerCard}
                              </a>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;
