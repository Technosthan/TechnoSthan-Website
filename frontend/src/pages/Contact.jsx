import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

const Contact = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const email = t("contact.email");
  const phone = t("contact.phone");
  const address = t("contact.address");
  const emailHref = `mailto:${email}`;
  const phoneHref = `tel:${String(phone).replace(/[^\d+]/g, "")}`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const whatsappHref = `https://wa.me/${String(phone).replace(/[^\d]/g, "")}`;

  return (
    <div className="section-shell">
      <div className="site-container py-[clamp(2.5rem,7vw,5rem)]">
        <div className={`overflow-hidden rounded-[2rem] ${theme.card}`}>
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-300">
                {t("contact.pageLabel")}
              </p>
              <h1 className={`mt-4 text-4xl font-black tracking-tight sm:text-5xl ${theme.text}`}>
                {t("contact.pageTitle")}
              </h1>
              <p className={`mt-6 max-w-2xl text-base leading-8 ${theme.textSecondary}`}>
                {t("contact.description")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/chat"
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg ${theme.button}`}
                >
                  {t("contact.ctaChat")}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/AgriTech Wiki"
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold ${theme.card} ${theme.border}`}
                >
                  {t("contact.ctaWiki")}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={emailHref}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <Mail className="text-emerald-600 dark:text-emerald-300" size={20} />
                <p className={`mt-4 text-sm font-semibold ${theme.text}`}>
                  {t("contact.emailShortLabel")}
                </p>
                <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                  {email}
                </p>
              </a>

              <a
                href={phoneHref}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <Phone className="text-emerald-600 dark:text-emerald-300" size={20} />
                <p className={`mt-4 text-sm font-semibold ${theme.text}`}>
                  {t("contact.phoneShortLabel")}
                </p>
                <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                  {phone}
                </p>
              </a>

              <a
                href={mapHref}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <MapPin className="text-emerald-600 dark:text-emerald-300" size={20} />
                <p className={`mt-4 text-sm font-semibold ${theme.text}`}>
                  {t("contact.locationShortLabel")}
                </p>
                <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                  {address}
                </p>
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10"
              >
                <MessageCircle className="text-emerald-600 dark:text-emerald-300" size={20} />
                <p className={`mt-4 text-sm font-semibold ${theme.text}`}>
                  {t("contact.whatsappShortLabel")}
                </p>
                <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                  {t("contact.whatsappDescription")}
                </p>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/5 p-6 dark:bg-white/5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
                {t("contact.emailLabel")}
              </p>
              <a href={emailHref} className={`mt-2 block text-base font-medium ${theme.link}`}>
                {email}
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
                {t("contact.phoneLabel")}
              </p>
              <a href={phoneHref} className={`mt-2 block text-base font-medium ${theme.link}`}>
                {phone}
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
                {t("contact.addressLabel")}
              </p>
              <a href={mapHref} target="_blank" rel="noreferrer" className={`mt-2 block text-base font-medium ${theme.link}`}>
                {t("contact.viewOnMap")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
