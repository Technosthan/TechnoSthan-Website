import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

const Contact = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${theme.bgGradient} ${theme.text} transition-colors duration-500`}
    >
      <Navbar />
      <div className="px-6 md:px-16 py-20 max-w-7xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${theme.accent} text-center`}>
          {t("contact.pageTitle")}
        </h1>
        <p className={`text-lg leading-relaxed text-center ${theme.text}`}>
          {t("contact.description")}
        </p>
        <div className="mt-8 text-center">
          <p className={`${theme.textSecondary}`}>
            {t("contact.emailLabel")} {t("contact.email")}
          </p>
          <p className={`${theme.textSecondary}`}>
            {t("contact.phoneLabel")} {t("contact.phone")}
          </p>
          <p className={`${theme.textSecondary}`}>
            {t("contact.addressLabel")} {t("contact.address")}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
