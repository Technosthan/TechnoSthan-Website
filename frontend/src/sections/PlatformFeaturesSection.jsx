import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Brain,
  CloudSun,
  GraduationCap,
  LayoutGrid,
  ShieldCheck,
  Sprout,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { platformFeatures } from "../content/homepageContent";
import { useTheme } from "../contexts/ThemeContext";

const ICON_MAP = {
  brain: Brain,
  book: BookOpen,
  chart: Sprout,
  "bar-chart": BarChart3,
  shield: ShieldCheck,
  cloud: CloudSun,
  layout: LayoutGrid,
  graduation: GraduationCap,
};

const PlatformFeaturesSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="site-container">
        <SectionHeading
          eyebrow={t("site.platform.eyebrow")}
          title={t("site.platform.title")}
          subtitle={t("site.platform.subtitle")}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {platformFeatures.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon] || Brain;

            return (
              <motion.article
                key={feature.key}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.03 }}
                className={`group ui-card flex h-full flex-col rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-2xl ${theme.card}`}
              >
                <div className="icon-chip rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
                  <Icon size={20} />
                </div>

                <h3 className={`mt-5 text-lg font-semibold ${theme.text}`}>
                  {t(feature.titleKey)}
                </h3>
                <p className={`mt-2 flex-1 text-sm leading-6 ${theme.textSecondary}`}>
                  {t(feature.descriptionKey)}
                </p>

                <Link
                  to={feature.path}
                  className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${theme.link}`}
                >
                  {t("site.platform.openFeature")}
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeaturesSection;
