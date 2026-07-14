import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

import {
  Leaf,
  GraduationCap,
  Cpu,
  Sprout,
  Tractor,
  ArrowRight,
} from "lucide-react";

const AboutSection = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const farmers = [
    {
      avif: "/optimized/farmer1-768.avif 768w, /optimized/farmer1-1536.avif 1536w",
      webp: "/optimized/farmer1-768.webp 768w, /optimized/farmer1-1536.webp 1536w",
      fallback: "/optimized/farmer1-1536.jpg",
      width: 1536,
      height: 1024,
    },
    {
      avif: "/optimized/farmer2-960.avif 960w, /optimized/farmer2-1536.avif 1536w",
      webp: "/optimized/farmer2-960.webp 960w, /optimized/farmer2-1536.webp 1536w",
      fallback: "/optimized/farmer2-1536.jpg",
      width: 2816,
      height: 1536,
    },
    {
      avif: "/optimized/farmer3-960.avif 960w, /optimized/farmer3-1536.avif 1536w",
      webp: "/optimized/farmer3-960.webp 960w, /optimized/farmer3-1536.webp 1536w",
      fallback: "/optimized/farmer3-1536.jpg",
      width: 2816,
      height: 1536,
    },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* TRUST SECTION */}
      <motion.section
        initial={{
          opacity: 0,
          y: 80,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
        }}
        viewport={{ once: true }}
        className="relative py-20 px-6 md:px-12"
      >
        {/* Heading */}
        <div className="text-center mb-14">
          {/* <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium text-sm shadow-md mb-5"
          >
            <Leaf size={16} />
            Trusted AgriTech Platform
          </motion.div> */}

          <h2 className={`text-4xl md:text-5xl font-black mb-5 ${theme.text}`}>
            {t("home.aboutSection.titleLine1")}
            <br />

            <span className={theme.accent}>
              {t("home.aboutSection.titleLine2")}
            </span>
          </h2>

          <p
            className={`max-w-3xl mx-auto text-lg leading-relaxed ${theme.textSecondary}`}
          >
            {t("home.aboutSection.subtitle")}
          </p>
        </div>

        {/* Farmer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {farmers.map((image, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.2,
              }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-[2rem] shadow-2xl border border-white/10"
            >
              {/* Image */}
              <picture>
                <source
                  type="image/avif"
                  srcSet={image.avif}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <source
                  type="image/webp"
                  srcSet={image.webp}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <img
                  src={image.fallback}
                  alt={`Farmer ${index + 1}`}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </picture>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <Tractor size={22} />
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {t("home.aboutSection.cardTitle")}
                    </h3>

                    <p className="text-gray-200 text-sm">
                      {t("home.aboutSection.cardDescription")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-green-300 font-medium text-sm">
                  {t("home.aboutSection.learnMore")}

                  <ArrowRight
                    size={16}
                    className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ABOUT SECTION */}
    </section>
  );
};

export default AboutSection;
