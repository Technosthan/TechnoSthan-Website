import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="grid md:grid-cols-2 gap-10 items-center px-6 md:px-16 py-20 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-gray-600 to-gray-500 text-transparent bg-clip-text drop-shadow-lg">
          Smart Agriculture for India 🇮🇳
        </h1>
        <p className="text-gray-700 dark:text-gray-200 mb-8 text-lg">
          Learn modern farming, test your knowledge, and monitor farm data using
          AI-powered tools.
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/register")}
          className="bg-gradient-to-r from-gray-500 to-gray-400 hover:scale-105 transition transform text-white px-8 py-4 rounded-2xl shadow-xl text-lg font-semibold"
        >
          Get Started
        </motion.button>
      </motion.div>
      <motion.img
        src="/hero.png"
        alt="Smart Farming"
        className="w-full rounded-2xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
};

export default HeroSection;
