import { motion } from "framer-motion";
import { BadgeCheck, Globe2, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { impactStories } from "../content/homepageContent";
import { useTheme } from "../contexts/ThemeContext";
import { getOptimizedImageUrl } from "../shared/lib/assetUrl";

const ImpactSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="site-container">
        <SectionHeading
          eyebrow={t("site.impact.eyebrow")}
          title={t("site.impact.title")}
          subtitle={t("site.impact.subtitle")}
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {impactStories.map((story, index) => (
            <motion.article
              key={story.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className={`overflow-hidden rounded-[2rem] ${theme.card}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={getOptimizedImageUrl(story.image)}
                  alt={story.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  <BadgeCheck size={14} />
                  {t(story.labelKey)}
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    {t(story.categoryKey)}
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                    {t(story.locationKey)}
                  </span>
                </div>

                <h3 className={`mt-4 text-xl font-semibold ${theme.text}`}>
                  {t(story.titleKey)}
                </h3>
                <p className={`mt-3 text-sm leading-6 ${theme.textSecondary}`}>
                  {t(story.summaryKey)}
                </p>

                <div className="mt-5 flex items-center gap-3 text-xs font-medium text-slate-400">
                  <Globe2 size={14} />
                  {t("site.impact.storySnapshot")}
                  <MapPin size={14} className="ml-2" />
                  {t(story.locationKey)}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
