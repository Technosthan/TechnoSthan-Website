import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-500">
      <Navbar />
      <div className="px-6 md:px-16 py-20 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-gray-600 to-gray-500 text-transparent bg-clip-text text-center">
          Contact Us
        </h1>
        <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed text-center">
          Have questions or feedback? Reach out to us at
          contact@kisangyanai.com. We're here to help you on your smart farming
          journey!
        </p>
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Email: contact@kisangyanai.com
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Phone: +91-123-456-7890
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
