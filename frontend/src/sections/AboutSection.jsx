import { motion } from "framer-motion";
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
  const { theme } = useTheme();

  const farmers = [
    "/farmer1.png",
    "/farmer2.png",
    "/farmer3.png",
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
          <motion.div
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
          </motion.div>

          <h2
            className={`text-4xl md:text-5xl font-black mb-5 ${theme.text}`}
          >
            Empowering Farmers
            <br />

            <span className={theme.accent}>
              & Students 🌾
            </span>
          </h2>

          <p
            className={`max-w-3xl mx-auto text-lg leading-relaxed ${theme.textSecondary}`}
          >
            Connecting agriculture with modern
            technology to help Indian farmers and
            students grow smarter, faster, and more
            sustainably.
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
              <img
                src={image}
                alt={`Farmer ${index + 1}`}
                className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-110"
              />

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
                      Smart Farming
                    </h3>

                    <p className="text-gray-200 text-sm">
                      Modern agricultural solutions
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-green-300 font-medium text-sm">
                  Learn More

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