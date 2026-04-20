import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const AboutSection = () => {
  const { theme } = useTheme();

  return (
    <>
      {/* TRUST / FARMER FEEL */}
      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`${theme.cardOpacity} py-16 text-center`}
      >
        <h2 className={`text-2xl md:text-3xl font-bold mb-8 ${theme.accent}`}>
          Empowering Farmers & Students 🌾
        </h2>
        <div className="flex flex-wrap justify-center gap-6 px-6">
          <img
            src="/farmer1.png"
            className="w-60 h-60 object-cover rounded-xl shadow-lg"
            alt="Farmer 1"
          />
          <img
            src="/farmer2.png"
            className="w-60 h-60 object-cover rounded-xl shadow-lg"
            alt="Farmer 2"
          />
          <img
            src="/farmer3.png"
            className="w-60 h-60 object-cover rounded-xl shadow-lg"
            alt="Farmer 3"
          />
        </div>
      </motion.section>

      {/* ABOUT */}
      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`${theme.cardOpacity} py-20 px-6 md:px-16 text-center`}
      >
        <h2 className={`text-3xl font-bold mb-6 ${theme.accent}`}>
          About TECHNOSTHAN AGRITECH
        </h2>
        <p className={`max-w-3xl mx-auto ${theme.text} dark:text-gray-200`}>
          TECHNOSTHAN AGRITECH is built to help farmers and students learn
          modern agriculture, use AI tools, and improve farming productivity
          through technology.
        </p>
      </motion.section>
    </>
  );
};

export default AboutSection;
