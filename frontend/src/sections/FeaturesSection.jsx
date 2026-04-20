import { motion } from "framer-motion";

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
    icon: "📊",
    title: "My Dashboard",
    desc: "Monitor your progress and performance.",
  },
];

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div
    whileHover={{ scale: 1.07, boxShadow: "0 8px 32px 0 rgba(128,128,128,0.15)" }}
    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg text-center transition"
  >
    <div className="text-4xl mb-2">{icon}</div>
    <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{desc}</p>
  </motion.div>
);

const FeaturesSection = () => {
  return (
    <>
      {/* FEATURES */}
      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-6 md:px-16 bg-gradient-to-r from-gray-50 to-gray-50 dark:from-gray-900 dark:to-gray-900"
      >
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-gray-600 to-gray-500 text-transparent bg-clip-text">
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
            <FeatureCard key={i} {...f} />
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
        <h2 className="text-3xl font-bold mb-12 bg-gradient-to-r from-gray-600 to-gray-500 text-transparent bg-clip-text">
          How It Works ⚡
        </h2>
        <div className="grid md:grid-cols-5 gap-6 text-lg font-medium text-gray-700 dark:text-gray-200">
          <div>📝 Register</div>
          <div>📚 Learn</div>
          <div>🧪 Quiz</div>
          <div>🤖 Ask AI</div>
          <div>📊 Monitor</div>
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
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-600 to-gray-500 text-transparent bg-clip-text">
            AI + IoT for Smart Farming
          </h2>
          <p className="text-gray-700 dark:text-gray-200">
            Use modern technology like sensors, AI, and data analytics to
            improve productivity and decision-making.
          </p>
        </div>
      </motion.section>
    </>
  );
};

export default FeaturesSection;
