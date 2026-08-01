import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Leaf, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

const AuthLayout = ({ title, subtitle, children, footerNote }) => {
  const { theme, appSettings } = useTheme();
  const { t } = useTranslation();

  const featureLines = [
    t("authLayout.feature1"),
    t("authLayout.feature2"),
    t("authLayout.feature3"),
  ];

  return (
    <section className="section-shell py-[clamp(2rem,5vw,4rem)]">
      <div className="site-container">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] md:px-8 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.12),_transparent_26%)]" />
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                  <Leaf size={22} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/80">
                    {t("authLayout.brandLabel")}
                  </p>
                  <h1 className="text-2xl font-bold">
                    {appSettings.appName || "TechnoSthan AgriTech"}
                  </h1>
                </div>
              </Link>

              <div className="mt-8 max-w-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">
                  {t("authLayout.secureAccess")}
                </p>
                <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                  {t("authLayout.heading")}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  {subtitle || t("authLayout.subtitle")}
                </p>
              </div>

              <div className="mt-8 grid gap-3">
                {featureLines.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
                  >
                    <BadgeCheck size={18} className="text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-200">
                    {t("authLayout.supportedAudience")}
                  </p>
                  <p className="text-sm leading-6 text-slate-300">
                    {t("authLayout.footerHint")}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <Sprout size={18} className="text-lime-300" />
                  <span>{t("authLayout.knowledgeHub")}</span>
                  <ArrowRight size={16} className="text-emerald-300" />
                </div>
              </div>
            </div>
          </aside>

          <div
            className={`surface-card surface-card--elevated px-5 py-6 md:px-8 md:py-8 ${theme.text}`}
          >
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
                {t("authLayout.accountAccess")}
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
                {title || t("authLayout.defaultTitle")}
              </h2>
            </div>

            {children}

            {footerNote ? (
              <p className="mt-6 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {footerNote}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
