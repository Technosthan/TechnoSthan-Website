import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

const About = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${theme.bgGradient} transition-colors duration-500`}
    >
      <Navbar />
      <div className="px-6 md:px-16 py-20 max-w-7xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${theme.accent} text-center`}>
          {t("about.pageTitle")}
        </h1>
        <p className={`text-lg leading-relaxed ${theme.text}`}>
          {t("about.description1")}
        </p>
        <p className={`text-lg leading-relaxed mt-4 ${theme.text}`}>
          {t("about.description2")}
        </p>
        <p className={`text-lg leading-relaxed mt-4 ${theme.text}`}>
          {t("about.description3")}
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default About;
