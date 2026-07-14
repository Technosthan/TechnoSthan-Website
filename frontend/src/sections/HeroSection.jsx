import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

import { ArrowRight, Sparkles, Leaf, Cpu, BarChart3 } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative grid lg:grid-cols-2 gap-14 items-center px-6 md:px-10 lg:px-16 py-16 md:py-24 max-w-7xl mx-auto">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {/* Badge */}
          {/* <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium text-sm mb-6 shadow-md"
          >
            <Sparkles size={16} />
            {t("home.hero.badge")}
          </motion.div> */}

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 ${theme.text}`}
          >
            {t("home.hero.titleLine1")}
            <br />

            <span className={`${theme.accent}`}>
              {t("home.hero.titleLine2")}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className={`${theme.textSecondary} text-lg md:text-xl leading-relaxed mb-8 max-w-xl`}
          >
            {t("home.hero.subtitle")}
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          >
            <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg">
              <Leaf className="text-green-500" size={22} />

              <span className="font-medium text-sm">
                {t("home.hero.featureSmartFarming")}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg">
              <Cpu className="text-blue-500" size={22} />

              <span className="font-medium text-sm">
                {t("home.hero.featureAISolutions")}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg">
              <BarChart3 className="text-yellow-500" size={22} />

              <span className="font-medium text-sm">
                {t("home.hero.featureFarmAnalytics")}
              </span>
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap gap-4"
          >
            {/* Primary Button */}
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => navigate("/AgriTech Wiki")}
              className={`${theme.button} group px-8 py-4 rounded-2xl shadow-2xl text-lg font-semibold flex items-center gap-3 cursor-pointer`}
            >
              {t("home.hero.exploreWiki")}

              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </motion.button>

            {/* Secondary Button */}
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md text-gray-800 dark:text-white shadow-lg font-semibold hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer"
            >
              {t("home.hero.viewDashboard")}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
          }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl rounded-full" />

          {/* Main Image */}
          <motion.div
            whileHover={{
              scale: 1.02,
            }}
            transition={{
              duration: 0.3,
            }}
            className="relative"
          >
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
                alt="Smart Farming"
                width="1536"
                height="1024"
                fetchPriority="high"
                decoding="async"
                className="w-full rounded-[2rem] shadow-2xl border border-white/20"
              />
            </picture>

            {/* Floating Card */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute -bottom-6 left-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-5 backdrop-blur-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <Leaf size={22} />
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">
                    AI Crop Monitoring
                  </h4>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Real-time farm insights
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
