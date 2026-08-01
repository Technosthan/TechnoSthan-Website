import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Leaf, Mail, MapPin, Phone } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { usePublicLayout } from "../contexts/PublicLayoutContext";

const Footer = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const inPublicLayout = usePublicLayout();

  if (inPublicLayout) {
    return null;
  }

  const year = new Date().getFullYear();
  const email = t("footer.email");
  const phone = t("footer.phone");
  const locationText = t("footer.location");
  const phoneHref = `tel:${String(phone).replace(/[^\d+]/g, "")}`;
  const emailHref = `mailto:${email}`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;

  const quickLinks = [
    { name: t("footer.linkHome"), path: "/" },
    { name: t("footer.linkAbout"), path: "/about" },
    { name: t("footer.linkContact"), path: "/contact" },
    { name: t("footer.linkWiki"), path: "/AgriTech Wiki" },
    { name: t("footer.privacyPolicy"), path: "/privacy" },
    { name: t("footer.termsOfService"), path: "/terms" },
  ];

  const services = [
    t("footer.serviceAIChatbot"),
    t("footer.serviceSmartFarming"),
    t("footer.serviceQuizLearning"),
    t("footer.serviceProgressTracking"),
  ];

  return (
    <footer className={`relative overflow-hidden border-t ${theme.footer}`}>
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="site-container relative py-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 text-white shadow-lg">
                <Leaf size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {t("footer.brandName")}
                </h3>
                <p className="text-sm font-medium text-emerald-300">
                  {t("footer.brandTagline")}
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-7 text-slate-300">
              {t("footer.tagline")}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
              >
                {t("navbar.login")}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
              >
                {t("navbar.contact")}
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
              >
                {t("navbar.aiChat")}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="group inline-flex items-center gap-1 text-slate-300 transition hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight
                      size={14}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              {t("footer.services")}
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              {services.map((service) => (
                <li
                  key={service}
                  className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 transition hover:border-emerald-400/30 hover:bg-white/10"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              {t("footer.contact")}
            </h4>

            <ul className="space-y-4 text-sm text-slate-300">
              <li>
                <a
                  href={emailHref}
                  className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-emerald-400/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                >
                  <Mail size={16} className="mt-0.5 text-emerald-300" />
                  <span className="break-all">{email}</span>
                </a>
              </li>

              <li>
                <a
                  href={phoneHref}
                  className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-emerald-400/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                >
                  <Phone size={16} className="mt-0.5 text-emerald-300" />
                  <span>{phone}</span>
                </a>
              </li>

              <li>
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-emerald-400/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                >
                  <MapPin size={16} className="mt-0.5 text-emerald-300" />
                  <span>{locationText}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p className="text-center md:text-left">
            {"\u00A9"} {year} TechnoSthan AgriTech. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              to="/privacy"
              className="transition hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            >
              {t("footer.privacyPolicy")}
            </Link>
            <Link
              to="/terms"
              className="transition hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
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
