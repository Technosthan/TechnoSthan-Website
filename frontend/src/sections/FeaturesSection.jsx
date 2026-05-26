import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

import {
  ChevronDown,
  ChevronUp,
  Leaf,
  Bot,
  BookOpen,
  BarChart3,
  ClipboardList,
  Building2,
  Code2,
  Hotel,
  Sparkles,
} from "lucide-react";

const agritechServices = [
  {
    icon: <BookOpen size={20} />,
    title: "Wiki",
  },
  {
    icon: <ClipboardList size={20} />,
    title: "Quiz",
  },
  {
    icon: <Bot size={20} />,
    title: "AI Chatbot",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Progress",
  },
];

const otherServices = [
  {
    icon: <Building2 size={22} />,
    title: "Innovation Hub",
  },
  {
    icon: <Code2 size={22} />,
    title: "IT Development",
  },
  {
    icon: <Hotel size={22} />,
    title: "Hospitality",
  },
];

const FeaturesSection = () => {
  const { theme } = useTheme();

  const [openAgritech, setOpenAgritech] =
    useState(false);

  return (
    <section className="py-16 px-6 md:px-12 relative overflow-hidden">
      {/* BG BLUR */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* HEADING */}
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
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-5">
            <Sparkles size={15} />
            TECHNOSTHAN SERVICES
          </div>

          <h2
            className={`text-4xl md:text-5xl font-black ${theme.text}`}
          >
            Our
            <span className={`ml-3 ${theme.accent}`}>
              Services 🚀
            </span>
          </h2>
        </motion.div>

        {/* SERVICES ROW */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* AGRITECH */}
          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            viewport={{ once: true }}
            className={`
              flex-1
              ${theme.card}
              border
              ${theme.border}
              rounded-[2rem]
              shadow-2xl
              overflow-hidden
            `}
          >
            {/* TOP BUTTON */}
            <button
              onClick={() =>
                setOpenAgritech(
                  !openAgritech,
                )
              }
              className="w-full flex items-center justify-between p-6 text-left group"
            >
              <div className="flex items-center gap-4">
                {/* ICON */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <Leaf size={26} />
                </div>

                {/* TEXT */}
                <div>
                  <h3
                    className={`text-2xl font-black ${theme.text}`}
                  >
                    AgriTech
                  </h3>

                  <p
                    className={`text-sm mt-1 ${theme.textSecondary}`}
                  >
                    Smart farming ecosystem
                  </p>
                </div>
              </div>

              {/* TOGGLE */}
              <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                {openAgritech ? (
                  <ChevronUp size={22} />
                ) : (
                  <ChevronDown size={22} />
                )}
              </div>
            </button>

            {/* DROPDOWN */}
            <AnimatePresence>
              {openAgritech && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4 px-6 pb-6">
                    {agritechServices.map(
                      (
                        service,
                        index,
                      ) => (
                        <motion.div
                          key={index}
                          whileHover={{
                            y: -4,
                          }}
                          className="bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                            {service.icon}
                          </div>

                          <span
                            className={`font-semibold text-sm ${theme.text}`}
                          >
                            {service.title}
                          </span>
                        </motion.div>
                      ),
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* OTHER SERVICES */}
          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            viewport={{ once: true }}
            className="flex-[1.2] grid sm:grid-cols-3 gap-5 w-full"
          >
            {otherServices.map(
              (service, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                  }}
                  className={`
                    ${theme.card}
                    border
                    ${theme.border}
                    rounded-[2rem]
                    p-6
                    shadow-xl
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    min-h-[190px]
                    group
                    cursor-pointer
                    relative
                    overflow-hidden
                  `}
                >
                  {/* HOVER EFFECT */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />

                  {/* ICON */}
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg mb-4">
                    {service.icon}
                  </div>

                  {/* TITLE */}
                  <h3
                    className={`relative z-10 text-lg font-bold ${theme.text}`}
                  >
                    {service.title}
                  </h3>
                </motion.div>
              ),
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;