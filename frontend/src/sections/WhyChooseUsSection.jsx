import { motion } from "framer-motion";
import {
  BookOpen,
  Cpu,
  MapPin,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { whyChooseItems } from "../content/homepageContent";
import { useTheme } from "../contexts/ThemeContext";

const ICON_MAP = {
  sprout: Sprout,
  cpu: Cpu,
  users: Users,
  map: MapPin,
  book: BookOpen,
  sparkles: Sparkles,
};

const WhyChooseUsSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="site-container">
        <SectionHeading
          eyebrow={t("site.whyChoose.eyebrow")}
          title={t("site.whyChoose.title")}
          subtitle={t("site.whyChoose.subtitle")}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {whyChooseItems.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || Sparkles;

            return (
              <motion.article
                key={item.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.03 }}
                className={`rounded-3xl p-5 ${theme.card}`}
              >
                <div className="icon-chip rounded-2xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <Icon size={20} />
                </div>
                <h3 className={`mt-5 text-lg font-semibold ${theme.text}`}>
                  {t(item.titleKey)}
                </h3>
                <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                  {t(item.descriptionKey)}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
