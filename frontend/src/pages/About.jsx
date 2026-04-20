import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";

const About = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${theme.bgGradient} transition-colors duration-500`}
    >
      <Navbar />
      <div className="px-6 md:px-16 py-20 max-w-7xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${theme.accent} text-center`}>
          About TECHNOSTHAN AGRITECH
        </h1>
        <p className={`text-lg leading-relaxed ${theme.text}`}>
          TECHNOSTHAN AGRITECH is an innovative AgriTech platform designed to
          empower farmers and students with modern agricultural knowledge and
          AI-powered tools. Our mission is to bridge the gap between traditional
          farming practices and cutting-edge technology, enabling sustainable
          and productive agriculture for India and beyond.
        </p>
        <p className={`text-lg leading-relaxed mt-4 ${theme.text}`}>
          Through our platform, users can learn about smart farming techniques,
          take quizzes to test their knowledge, interact with an AI chatbot for
          instant advice, and monitor real-time farm data via IoT dashboards. We
          believe in making technology accessible to everyone in the
          agricultural community.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default About;
