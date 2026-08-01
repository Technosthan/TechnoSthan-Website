import { motion } from "framer-motion";
import { BookOpen, Cpu, Leaf, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { homepageStats } from "../content/homepageContent";
import { useTheme } from "../contexts/ThemeContext";

const ICON_MAP = {
  sprout: Sprout,
  book: BookOpen,
  cpu: Cpu,
  leaf: Leaf,
};

const StatsStrip = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="py-[clamp(1.5rem,4vw,3rem)]">
      <div className="site-container">
        <SectionHeading
          eyebrow={t("site.stats.eyebrow")}
          title={t("site.stats.title")}
          subtitle={t("site.stats.subtitle")}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {homepageStats.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || Leaf;

            return (
              <motion.article
                key={item.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className={`ui-card h-full rounded-3xl p-5 ${theme.card}`}
              >
                <div className="flex items-start gap-4">
                  <div className="icon-chip rounded-2xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className={`text-lg font-semibold ${theme.text}`}>
                      {t(item.titleKey)}
                    </h3>
                    <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                      {t(item.descriptionKey)}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
