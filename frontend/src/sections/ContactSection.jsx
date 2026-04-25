import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const ContactSection = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <motion.section
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className={`${theme.primary} text-white text-center py-20`}
    >
      <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">
        Start Your Smart Farming Journey 🌱
      </h2>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate("/AgriTech Wiki")}
        className={`${theme.buttonSecondary} font-bold px-8 py-4 rounded-2xl shadow-xl text-lg`}
      >
        Demo
      </motion.button>
    </motion.section>
  );
};

export default ContactSection;
