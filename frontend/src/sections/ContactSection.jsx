import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ContactSection = () => {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-gray-500 to-gray-400 text-white text-center py-20"
    >
      <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">
        Start Your Smart Farming Journey 🌱
      </h2>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate("/register")}
        className="bg-white text-gray-700 font-bold px-8 py-4 rounded-2xl shadow-xl text-lg"
      >
        Join Now 
      </motion.button>
    </motion.section>
  );
};

export default ContactSection;
