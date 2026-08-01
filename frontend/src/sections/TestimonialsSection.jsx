import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import { testimonials } from "../content/homepageContent";
import { useTheme } from "../contexts/ThemeContext";
import { getOptimizedImageUrl } from "../shared/lib/assetUrl";

const TestimonialsSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <section className="py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="site-container">
        <SectionHeading
          eyebrow={t("site.testimonials.eyebrow")}
          title={t("site.testimonials.title")}
          subtitle={t("site.testimonials.subtitle")}
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((person, index) => (
            <motion.article
              key={person.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className={`rounded-[2rem] p-5 ${theme.card}`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={getOptimizedImageUrl(person.image)}
                  alt={t(person.nameKey)}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <h3 className={`truncate text-lg font-semibold ${theme.text}`}>
                    {t(person.nameKey)}
                  </h3>
                  <p className={`text-sm ${theme.textSecondary}`}>{t(person.roleKey)}</p>
                  <p className="mt-1 text-xs text-slate-500">{t(person.locationKey)}</p>
                </div>
              </div>

              <div className="mt-5">
                <Quote className="text-emerald-500" size={22} />
                <p className={`mt-3 text-sm leading-7 ${theme.textSecondary}`}>
                  {t(person.quoteKey)}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={14} fill="currentColor" />
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
