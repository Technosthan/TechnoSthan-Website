import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black/90 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 text-transparent bg-clip-text mb-4">
              TECHNOSTHAN AGRITECH
            </h3>
            <p className="text-sm">
              Empowering farmers and students with AI-powered agriculture tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-green-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-green-400 transition">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-green-400 transition"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>AI Chatbot</li>
              <li>IoT Dashboard</li>
              <li>Learning Modules</li>
              <li>Quiz System</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: contact@kisangyanai.com</li>
              <li>Phone: +91-123-456-7890</li>
              <li>Address: India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>
            © 2026 TECHNOSTHAN AGRITECH | Built by technoSthan | All rights
            reserved.
          </p>
          <p className="mt-2">
            <Link
              to="/privacy"
              className="hover:text-green-400 transition mr-4"
            >
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-green-400 transition">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
