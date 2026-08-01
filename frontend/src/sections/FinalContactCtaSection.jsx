import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Mail, PhoneCall, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { finalContactActions } from "../content/homepageContent";
import { useTheme } from "../contexts/ThemeContext";

const ACTION_ICON_MAP = {
  "/contact": Mail,
  "/chat": MessageCircle,
  "/AgriTech Wiki": BookOpen,
};

const FinalContactCtaSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const contactEmail = t("footer.email");
  const contactPhone = t("footer.phone");
  const emailHref = `mailto:${contactEmail}`;
  const phoneHref = `tel:${String(contactPhone).replace(/[^\d+]/g, "")}`;
  const whatsappHref = `https://wa.me/${String(contactPhone).replace(/[^\d]/g, "")}`;

  return (
    <section className="pb-[clamp(4rem,8vw,7rem)] pt-[clamp(1rem,4vw,2rem)]">
      <div className="site-container">
        <div className={`overflow-hidden rounded-[2.25rem] ${theme.card}`}>
          <div className="grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
            <div>
              <SectionHeading
                align="left"
                eyebrow={t("site.finalCta.eyebrow")}
                title={t("site.finalCta.title")}
                subtitle={t("site.finalCta.subtitle")}
                className="mx-0 max-w-none"
              />

              <div className="mt-6 flex flex-wrap gap-3">
                {finalContactActions.map((action) => {
                  const Icon = ACTION_ICON_MAP[action.path] || ArrowRight;
                    const toneClass =
                      action.tone === "primary"
                        ? theme.button
                        : action.tone === "secondary"
                          ? theme.buttonSecondary
                          : `${theme.navItem} ${theme.navItemHover}`;

                    return (
                <Link
                  key={action.key}
                  to={action.path}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition ${toneClass}`}
                >
                  <Icon size={16} />
                  {t(action.labelKey)}
                </Link>
                );
              })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/5 p-5 dark:bg-white/5">
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                {t("site.finalCta.quickContact")}
              </h3>
              <p className={`mt-2 text-sm leading-6 ${theme.textSecondary}`}>
                {t("site.finalCta.quickContactSubtitle")}
              </p>

              <div className="mt-5 grid gap-3">
                <a
                  href={emailHref}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="inline-flex items-center gap-2">
                    <Mail size={16} className="text-emerald-500" />
                    {t("site.finalCta.email")}
                  </span>
                  <span className={`truncate ${theme.textSecondary}`}>
                    {contactEmail}
                  </span>
                </a>
                <a
                  href={phoneHref}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="inline-flex items-center gap-2">
                    <PhoneCall size={16} className="text-emerald-500" />
                    {t("site.finalCta.phone")}
                  </span>
                  <span className={`truncate ${theme.textSecondary}`}>
                    {contactPhone}
                  </span>
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle size={16} className="text-emerald-500" />
                    {t("site.finalCta.whatsapp")}
                  </span>
                  <span className={theme.textSecondary}>{t("site.finalCta.openChat")}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalContactCtaSection;
