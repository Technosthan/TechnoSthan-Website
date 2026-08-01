import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { getAllContent } from "../features/content/contentApi";
import { useTheme } from "../contexts/ThemeContext";
import { getOptimizedImageUrl, resolveAssetUrl } from "../shared/lib/assetUrl";

const MAX_ITEMS = 4;

const extractImage = (content = {}) => {
  const candidates = [
    content.coverImage,
    content.thumbnailUrl,
    content.image,
    content.heroImage,
    content.bannerImage,
  ].filter(Boolean);

  if (candidates.length > 0) {
    return candidates[0];
  }

  const imageResource = Array.isArray(content.resources)
    ? content.resources.find((resource) => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(String(resource?.url || "")))
    : null;

  return imageResource?.url || "";
};

const readingTimeLabel = (content = {}) => {
  if (content.readingTime) return `${content.readingTime} min read`;

  const text = `${content.title || ""} ${content.description || ""}`;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
};

const LatestWikiSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllContent();
        const nextItems = Array.isArray(response.data?.data) ? response.data.data : [];
        if (!cancelled) {
          setItems(nextItems.slice(0, MAX_ITEMS));
        }
      } catch (err) {
        if (cancelled) return;
        setItems([]);
        setError(err.response?.status === 401 || err.response?.status === 403
          ? "Wiki preview is limited by the current public-access configuration."
          : err.response?.data?.message || err.message || "Unable to load wiki articles.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      ),
    [items],
  );

  return (
    <section className="py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="site-container">
        <SectionHeading
          eyebrow={t("site.latestWiki.eyebrow")}
          title={t("site.latestWiki.title")}
          subtitle={t("site.latestWiki.subtitle")}
        />

        {loading ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse rounded-[2rem] p-4 ${theme.card}`}
              >
                <div className="aspect-[4/3] rounded-2xl bg-black/10 dark:bg-white/10" />
                <div className="mt-4 h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
                <div className="mt-3 h-5 w-5/6 rounded bg-black/10 dark:bg-white/10" />
                <div className="mt-2 h-4 w-full rounded bg-black/10 dark:bg-white/10" />
                <div className="mt-2 h-4 w-4/5 rounded bg-black/10 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : sortedItems.length > 0 ? (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sortedItems.map((item, index) => {
                const imageUrl = extractImage(item);
                const category = item.category || item.topic || t("site.latestWiki.defaultCategory");
                const description =
                  item.description ||
                  t("site.latestWiki.defaultDescription");

                return (
                  <motion.article
                    key={item._id || item.id || index}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.03 }}
                    className={`overflow-hidden rounded-[2rem] ${theme.card}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={getOptimizedImageUrl(resolveAssetUrl(imageUrl))}
                          alt={item.title || "Wiki article"}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-amber-400 text-white">
                          <BookOpen size={36} />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
                        {category}
                      </p>
                      <h3 className={`mt-3 text-lg font-semibold ${theme.text}`}>
                        {item.title || t("site.latestWiki.defaultTitle")}
                      </h3>
                      <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                        {description}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>{readingTimeLabel(item)}</span>
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : t("site.latestWiki.recent")}
                        </span>
                      </div>

                      <Link
                        to="/AgriTech Wiki"
                        className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${theme.link}`}
                      >
                        {t("site.latestWiki.openWiki")}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                to="/AgriTech Wiki"
                className={`primary-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold`}
              >
                {t("site.latestWiki.viewAll")}
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className={`mt-10 rounded-[2rem] p-6 ${theme.card}`}>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className={`text-xl font-semibold ${theme.text}`}>
                  {t("site.latestWiki.unavailableTitle")}
                </h3>
                <p className={`mt-2 max-w-2xl text-sm leading-6 ${theme.textSecondary}`}>
                  {t("site.latestWiki.unavailableSubtitle")}
                </p>
              </div>
              <Link
                to="/AgriTech Wiki"
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold ${theme.button}`}
              >
                {t("site.latestWiki.openWiki")}
                <ArrowRight size={16} />
              </Link>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
                {error}
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  <RefreshCcw size={14} />
                  {t("site.latestWiki.retry")}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestWikiSection;
