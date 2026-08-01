import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Sprout, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { trainingTopics } from "../content/homepageContent";
import { useTheme } from "../contexts/ThemeContext";

const ICON_MAP = {
  workshops: Users,
  students: GraduationCap,
  ai: Sparkles,
  demo: Sprout,
};

const TrainingSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="site-container">
        <SectionHeading
          eyebrow={t("site.training.eyebrow")}
          title={t("site.training.title")}
          subtitle={t("site.training.subtitle")}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trainingTopics.map((topic, index) => {
            const Icon = ICON_MAP[topic.key] || Sparkles;

            return (
              <motion.article
                key={topic.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className={`rounded-[2rem] p-5 ${theme.card}`}
              >
                <div className="icon-chip rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
                  <Icon size={20} />
                </div>
                <h3 className={`mt-5 text-lg font-semibold ${theme.text}`}>
                  {t(topic.titleKey)}
                </h3>
                <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                  {t(topic.descriptionKey)}
                </p>

                <Link
                  to={topic.path}
                  className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${theme.link}`}
                >
                  {t("site.training.learnMore")}
                  <ArrowRight size={16} />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrainingSection;
