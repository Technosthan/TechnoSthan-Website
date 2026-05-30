import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

import { Leaf, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#06111f]">
      {/* BG BLUR */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-12">
        {/* TOP */}
        <div className="grid lg:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          {/* BRAND */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                <Leaf size={24} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {t("footer.brandName")}
                </h3>

                <p className="text-sm text-green-400">
                  {t("footer.brandTagline")}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
              {t("footer.tagline")}
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="text-white font-semibold mb-5">
              {t("footer.quickLinks")}
            </h4>

            <ul className="space-y-3 text-sm">
              {[
                {
                  name: t("footer.linkHome"),
                  path: "/",
                },
                {
                  name: t("footer.linkAbout"),
                  path: "/about",
                },
                {
                  name: t("footer.linkContact"),
                  path: "/contact",
                },
                {
                  name: t("footer.linkWiki"),
                  path: "/AgriTech Wiki",
                },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="group flex items-center text-gray-400 hover:text-green-400 transition-all duration-300"
                  >
                    {item.name}

                    <ArrowUpRight
                      size={14}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <h4 className="text-white font-semibold mb-5">
              {t("footer.services")}
            </h4>

            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-green-400 transition cursor-pointer">
                {t("footer.serviceAIChatbot")}
              </li>

              <li className="hover:text-green-400 transition cursor-pointer">
                {t("footer.serviceSmartFarming")}
              </li>

              <li className="hover:text-green-400 transition cursor-pointer">
                {t("footer.serviceQuizLearning")}
              </li>

              <li className="hover:text-green-400 transition cursor-pointer">
                {t("footer.serviceProgressTracking")}
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="text-white font-semibold mb-5">
              {t("footer.contact")}
            </h4>

            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-green-400 mt-0.5" />

                <span>{t("footer.email")}</span>
              </li>

              <li className="flex items-start gap-3">
                <Phone size={16} className="text-green-400 mt-0.5" />

                <span>{t("footer.phone")}</span>
              </li>

              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-green-400 mt-0.5" />

                <span>{t("footer.location")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-sm text-gray-500 text-center md:text-left">
            {t("footer.rights")}
          </p>

          <div className="flex items-center gap-5 text-sm">
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-green-400 transition"
            >
              {t("footer.privacyPolicy")}
            </Link>

            <Link
              to="/terms"
              className="text-gray-500 hover:text-green-400 transition"
            >
              {t("footer.termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
