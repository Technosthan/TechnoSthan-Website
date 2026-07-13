import { useEffect, useMemo, useState } from "react";
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

const FeaturesSection = () => {
  const { language } = useTheme();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

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
        setSelectedId((current) => {
          if (current && nextServices.some((service) => (service._id || service.id) === current)) {
            return current;
          }

          const firstExpandable = nextServices.find((service) => (service.innerServices || []).length > 0);
          return firstExpandable?._id || firstExpandable?.id || null;
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

  const selectedService = useMemo(
    () => sortedServices.find((service) => (service._id || service.id) === selectedId) || null,
    [selectedId, sortedServices],
  );

  const expandedInnerServices = selectedService?.innerServices || [];
  const hasExpandableServices = expandedInnerServices.length > 0;

  const handleToggle = (serviceId, expandable) => {
    if (!expandable) return;
    setSelectedId((current) => (current === serviceId ? null : serviceId));
  };

  const iconFor = (value = "") => ICON_MAP[value] || DEFAULT_ICON;

  const panelMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -14 },
        transition: { duration: 0.25 },
      };

  return (
    <section className="relative overflow-hidden bg-[#07111f] px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            <Sparkles size={15} />
            {t("home.features.badge")}
          </div>
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
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sortedServices.map((service) => {
                const id = service._id || service.id;
                const expandable = (service.innerServices || []).length > 0;
                const active = selectedId === id;
                const Icon = iconFor(service.icon);

                const card = (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                        style={{ background: service.accentColor || "#16a34a" }}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      {expandable ? (
                        <ChevronDown
                          className={`mt-1 h-5 w-5 transition ${active ? "rotate-180 text-emerald-300" : "text-slate-400"}`}
                        />
                      ) : null}
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-white">
                      {getLocalizedText(service.name, activeLanguage)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {getLocalizedText(service.description, activeLanguage)}
                    </p>
                  </>
                );

                if (!expandable) {
                  return (
                    <div
                      key={id}
                      className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur"
                    >
                      {card}
                    </div>
                  );
                }

                return (
                  <button
                    key={id}
                    type="button"
                    aria-expanded={active}
                    onClick={() => handleToggle(id, expandable)}
                    className={`rounded-[2rem] border p-5 text-left shadow-2xl backdrop-blur transition duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 ${
                      active
                        ? "border-emerald-400/60 bg-slate-950 text-white"
                        : "border-white/10 bg-white/5 text-white hover:border-emerald-300/40 hover:bg-white/10"
                    }`}
                    style={
                      active
                        ? { boxShadow: `0 28px 70px ${service.accentColor || "#16a34a"}22` }
                        : {}
                    }
                  >
                    {card}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {selectedService && hasExpandableServices ? (
                <motion.div
                  key={selectedService._id || selectedService.id}
                  {...panelMotion}
                  className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl backdrop-blur sm:p-8"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                        {t("home.features.badge")}
                      </div>
                      <h3 className="mt-4 text-3xl font-black tracking-tight text-white">
                        {getLocalizedText(selectedService.name, activeLanguage)}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {expandedInnerServices.map((inner, index) => {
                      const title = getLocalizedText(inner.title, activeLanguage) || `Inner service ${index + 1}`;
                      const description = getLocalizedText(inner.description, activeLanguage);
                      const clickable = isSafeServiceUrl(inner.redirectUrl);
                      const Icon = iconFor(inner.icon || selectedService.icon);

                      const innerCard = (
                        <div className="group h-full rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:border-emerald-300/40 hover:bg-white/10">
                          <div className="flex items-start gap-4">
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                              style={{ background: selectedService.accentColor || "#16a34a" }}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-white">{title}</h4>
                                {clickable ? (
                                  <ExternalLink className="mt-0.5 h-4 w-4 text-slate-400 transition group-hover:text-emerald-300" />
                                ) : null}
                              </div>
                              {description ? (
                                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );

                      if (!clickable) {
                        return <div key={inner._id || inner.id || index}>{innerCard}</div>;
                      }

                      return (
                        <a
                          key={inner._id || inner.id || index}
                          href={inner.redirectUrl}
                          target={inner.openInNewTab ? "_blank" : "_self"}
                          rel={inner.openInNewTab ? "noreferrer" : undefined}
                          className="block h-full"
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
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;
