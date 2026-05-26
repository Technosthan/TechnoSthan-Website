import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

import {
  ArrowRight,
  Sparkles,
  Leaf,
  Tractor,
} from "lucide-react";

const ContactSection = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <section className="relative py-14 px-5 md:px-10 overflow-hidden">
      {/* BG EFFECT */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-green-500/10 blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full" />

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
        }}
        viewport={{ once: true }}
        className="
          relative
          max-w-6xl
          mx-auto
          rounded-[2.2rem]
          overflow-hidden
          bg-gradient-to-r
          from-[#0f172a]
          via-[#052e16]
          to-[#064e3b]
          border
          border-white/10
          shadow-2xl
        "
      >
        <div className="grid lg:grid-cols-2 items-center gap-8 px-6 md:px-10 py-10 md:py-12">
          {/* LEFT */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-400/20 text-green-400 text-sm font-medium mb-5">
              <Sparkles size={14} />
              Start Smart Farming
            </div>

            {/* HEADING */}
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              Smart Farming
              <br />

              Starts Here 🌱
            </h2>

            {/* TEXT */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl mb-8">
              Learn AgriTech, explore AI tools,
              monitor farming progress, and improve
              agricultural productivity with
              TECHNOSTHAN AGRITECH.
            </p>

            {/* BUTTON */}
            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                navigate("/AgriTech Wiki")
              }
              className="
                group
                inline-flex
                items-center
                gap-3
                bg-green-500
                hover:bg-green-400
                text-white
                px-7
                py-3.5
                rounded-2xl
                font-semibold
                shadow-xl
                transition-all
                duration-300
              "
            >
              Explore AgriTech

              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </motion.button>
          </div>

          {/* RIGHT CARD */}
          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            viewport={{ once: true }}
            className="
              relative
              bg-white/5
              border
              border-white/10
              backdrop-blur-xl
              rounded-[2rem]
              p-6
              shadow-2xl
              overflow-hidden
            "
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-70" />

            {/* TOP */}
            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                <Tractor size={28} />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  AI Agriculture
                </h3>

                <p className="text-sm text-gray-300">
                  Smart & sustainable farming
                </p>
              </div>
            </div>

            {/* FEATURES */}
            <div className="relative z-10 space-y-3">
              {[
                "Smart Crop Monitoring",
                "AI Farming Solutions",
                "Sustainable Agriculture",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    x: 4,
                  }}
                  className="
                    flex
                    items-center
                    gap-3
                    bg-white/5
                    hover:bg-white/10
                    border
                    border-white/10
                    rounded-2xl
                    px-4
                    py-3
                    transition-all
                    duration-300
                  "
                >
                  <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                    <Leaf size={18} />
                  </div>

                  <span className="text-white font-medium text-sm">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactSection;