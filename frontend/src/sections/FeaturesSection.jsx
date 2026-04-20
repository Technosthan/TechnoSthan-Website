import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const features = [
  {
    icon: "🌱",
    title: "Learning",
    desc: "Explore smart farming techniques and modern agriculture.",
  },
  {
    icon: "🧪",
    title: "Quiz",
    desc: "Test your knowledge and challenge yourself.",
  },
  {
    icon: "🤖",
    title: "AI Chatbot",
    desc: "Ask farming questions and get instant answers.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    desc: "Monitor your learning progress and achievements.",
  },
];

const FeatureCard = ({ icon, title, desc, theme }) => (
  <motion.div
    whileHover={{ scale: 1.07, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.15)" }}
    className={`${theme.cardOpacity} backdrop-blur-lg p-6 rounded-2xl shadow-lg text-center transition`}
  >
    <div className="text-4xl mb-2">{icon}</div>
    <h3 className={`font-semibold text-lg ${theme.accent}`}>{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{desc}</p>
  </motion.div>
);

const FeaturesSection = () => {
  const { theme } = useTheme();

  return (
    <>
      {/* FEATURES */}
      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`py-20 px-6 md:px-16 ${theme.bgGradient}`}
      >
        <h2 className={`text-3xl font-bold text-center mb-12 ${theme.accent}`}>
          What You Can Do
        </h2>
        <motion.div
          className="grid sm:grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} theme={theme} />
          ))}
        </motion.div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-6 md:px-16 text-center"
      >
        <h2 className={`text-3xl font-bold mb-12 ${theme.accent}`}>
          How It Works ⚡
        </h2>
        <div
          className={`grid md:grid-cols-4 gap-6 text-lg font-medium ${theme.text}`}
        >
          <div>📚 Learn</div>
          <div>🧪 Quiz</div>
          <div>🤖 Ask AI</div>
          <div>📈 Progress</div>
        </div>
      </motion.section>

      {/* TECH SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-10 items-center px-6 md:px-16 py-20 max-w-7xl mx-auto"
      >
        <img
          src="/farm-tech.png"
          className="rounded-2xl shadow-lg"
          alt="Farm Tech"
        />
        <div>
          <h2 className={`text-3xl font-bold mb-4 ${theme.accent}`}>
            AI + IoT for Smart Farming
          </h2>
          <p className={`${theme.text} dark:text-gray-200`}>
            Use modern technology like sensors, AI, and data analytics to
            improve productivity and decision-making.
          </p>
        </div>
      </motion.section>
    </>
  );
};

export default FeaturesSection;
