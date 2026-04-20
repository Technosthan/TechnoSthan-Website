import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTheme } from "../contexts/ThemeContext";

const Contact = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${theme.bgGradient} transition-colors duration-500`}
    >
      <Navbar />
      <div className="px-6 md:px-16 py-20 max-w-7xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${theme.accent} text-center`}>
          Contact Us
        </h1>
        <p className={`text-lg leading-relaxed text-center ${theme.text}`}>
          Have questions or feedback? Reach out to us at
          agritech@technosthan.com. We're here to help you on your smart farming
          journey!
        </p>
        <div className="mt-8 text-center">
          <p className={`text-gray-600 dark:text-gray-300 ${theme.text}`}>
            Email: agritech@technosthan.com
          </p>
          <p className={`text-gray-600 dark:text-gray-300 ${theme.text}`}>
            Phone: +91-9477288288
          </p>
          <p className={`text-gray-600 dark:text-gray-300 ${theme.text}`}>
            Address: 47/1 New Sanganer Road, Sodala, Jaipur, Rajasthan 302019
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
