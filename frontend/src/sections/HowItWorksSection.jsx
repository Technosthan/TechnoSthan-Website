import { motion } from "framer-motion";
import { ChevronRight, CircleCheckBig } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { howItWorksSteps } from "../content/homepageContent";
import { useTheme } from "../contexts/ThemeContext";

const HowItWorksSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="site-container">
        <SectionHeading
          eyebrow={t("site.howItWorks.eyebrow")}
          title={t("site.howItWorks.title")}
          subtitle={t("site.howItWorks.subtitle")}
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {howItWorksSteps.map((step, index) => (
            <motion.article
              key={step.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className={`relative rounded-3xl border ${theme.border} ${theme.card} p-5`}
            >
              <div className="flex items-center gap-3">
                <div className="icon-chip rounded-2xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <CircleCheckBig size={20} />
                </div>
                <span className="text-sm font-semibold tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
                  {step.step}
                </span>
              </div>

              <h3 className={`mt-4 text-lg font-semibold ${theme.text}`}>
                {t(step.titleKey)}
              </h3>
              <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                {t(step.descriptionKey)}
              </p>

              {index < howItWorksSteps.length - 1 ? (
                <ChevronRight className="mt-5 hidden text-emerald-300 lg:block" size={18} />
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
