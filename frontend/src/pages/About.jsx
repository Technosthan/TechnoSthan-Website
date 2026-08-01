import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Leaf,
  Sprout,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

const aboutPoints = [
  {
    titleKey: "about.points.practical.title",
    descriptionKey: "about.points.practical.description",
    icon: Leaf,
  },
  {
    titleKey: "about.points.audience.title",
    descriptionKey: "about.points.audience.description",
    icon: Users,
  },
  {
    titleKey: "about.points.learning.title",
    descriptionKey: "about.points.learning.description",
    icon: BookOpen,
  },
  {
    titleKey: "about.points.flows.title",
    descriptionKey: "about.points.flows.description",
    icon: Brain,
  },
];

const About = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className="section-shell">
      <div className="site-container py-[clamp(2.5rem,7vw,5rem)]">
        <div className={`overflow-hidden rounded-[2rem] ${theme.card}`}>
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-300">
                {t("about.pageLabel")}
              </p>
              <h1 className={`mt-4 text-4xl font-black tracking-tight sm:text-5xl ${theme.text}`}>
                {t("about.pageTitle")}
              </h1>
              <p className={`mt-6 max-w-2xl text-base leading-8 ${theme.textSecondary}`}>
                {t("about.description1")}
              </p>
              <p className={`mt-4 max-w-2xl text-base leading-8 ${theme.textSecondary}`}>
                {t("about.description2")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/AgriTech Wiki"
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg ${theme.button}`}
                >
                  {t("about.ctaWiki")}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/chat"
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold ${theme.card} ${theme.border}`}
                >
                  {t("about.ctaChat")}
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/5 p-5 dark:bg-white/5">
              <div className="grid gap-4 sm:grid-cols-2">
                {aboutPoints.map((point) => {
                  const Icon = point.icon;

                  return (
                    <article
                      key={point.titleKey}
                      className="rounded-3xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="icon-chip rounded-2xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                        <Icon size={18} />
                      </div>
                      <h2 className={`mt-4 text-base font-semibold ${theme.text}`}>
                        {t(point.titleKey)}
                      </h2>
                      <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                        {t(point.descriptionKey)}
                      </p>
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <div className="flex items-start gap-3">
                  <Sprout className="mt-1 text-emerald-600 dark:text-emerald-300" size={20} />
                  <div>
                    <p className={`text-sm font-semibold ${theme.text}`}>
                      {t("about.highlightTitle")}
                    </p>
                    <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                      {t("about.description3")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
