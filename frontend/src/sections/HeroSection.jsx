import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Brain, Leaf, Sparkles, Sprout } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden py-[clamp(3rem,8vw,6.5rem)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-6 top-6 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" />
      </div>

      <div className="site-container relative grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="min-w-0"
        >
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles size={15} />
            Smart agriculture platform
          </div> */}

          <h1
            className={`mt-6 max-w-3xl text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[clamp(3.5rem,5vw,4.6rem)] ${theme.text}`}
          >
            {t("home.hero.titleLine1")}
            <br />
            <span className={theme.accent}>{t("home.hero.titleLine2")}</span>
          </h1>

          <p className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${theme.textSecondary}`}>
            {t("home.hero.subtitle")}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Sprout, label: t("home.hero.featureSmartFarming") },
              { icon: Brain, label: t("home.hero.featureAISolutions") },
              { icon: BarChart3, label: t("home.hero.featureFarmAnalytics") },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 ${theme.card}`}
                >
                  <div className="icon-chip rounded-2xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/AgriTech Wiki")}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold shadow-xl transition ${theme.button}`}
            >
              {t("home.hero.exploreWiki")}
              <ArrowRight size={18} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-base font-semibold shadow-lg transition ${theme.card} ${theme.text}`}
            >
              {t("home.hero.viewDashboard")}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative min-w-0"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-transparent to-amber-400/20 blur-3xl" />
          <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 ${theme.card}`}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <picture>
                <source
                  type="image/avif"
                  srcSet="/optimized/hero-768.avif 768w, /optimized/hero-1536.avif 1536w"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <source
                  type="image/webp"
                  srcSet="/optimized/hero-768.webp 768w, /optimized/hero-1536.webp 1536w"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <img
                  src="/optimized/hero-1536.jpg"
                  alt="Smart agriculture platform preview"
                  width="1536"
                  height="1024"
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </picture>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-3xl border border-white/10 bg-slate-950/75 p-4 text-white shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="icon-chip rounded-2xl bg-emerald-500 text-white">
                    <Leaf size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Actionable support</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Keep learning, ask for help, and move from question to action.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
