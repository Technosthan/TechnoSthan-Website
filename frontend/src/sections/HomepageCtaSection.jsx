import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  getCtaIcon,
  isExternalCtaLink,
  normalizeCtaButtonLink,
} from "../features/homepageCtaSections/homepageCtaSections.utils";

const HomepageCtaSection = ({ section = {} }) => {
  const HeadingIcon = getCtaIcon(section.headingIconKey);
  const PanelIcon = getCtaIcon(section.panelIconKey);
  const features = Array.isArray(section.features) ? section.features : [];
  const buttonLink = normalizeCtaButtonLink(section.buttonLink);
  const isExternal = isExternalCtaLink(buttonLink);
  const openInNewTab = Boolean(section.openInNewTab);
  const buttonTarget = isExternal && openInNewTab ? "_blank" : "_self";
  const buttonRel = isExternal && openInNewTab ? "noopener noreferrer" : undefined;
  const ButtonComponent = buttonLink.startsWith("/") && !isExternal ? Link : "a";
  const buttonProps = ButtonComponent === Link
    ? { to: buttonLink, target: openInNewTab ? "_blank" : undefined, rel: openInNewTab ? "noopener noreferrer" : undefined }
    : { href: buttonLink, target: buttonTarget, rel: buttonRel };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="
        relative
        max-w-6xl
        mx-auto
        rounded-[2.2rem]
        overflow-hidden
        bg-gradient-to-r
        from-[#0f172a]
        via-[#052e16]
        to-[#064e3b]
        border
        border-white/10
        shadow-2xl
      "
    >
      <div className="grid lg:grid-cols-2 items-center gap-8 px-6 md:px-10 py-10 md:py-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            <span>{section.heading || ""}</span>
            <span className="ml-2 inline-flex translate-y-[-1px] items-center align-middle text-green-300">
              <HeadingIcon className="h-6 w-6" />
            </span>
          </h2>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl mb-8">
            {section.description || ""}
          </p>

          <ButtonComponent
            {...buttonProps}
            className="
              group
              inline-flex
              items-center
              gap-3
              bg-green-500
              hover:bg-green-400
              text-white
              px-7
              py-3.5
              rounded-2xl
              font-semibold
              shadow-xl
              transition-all
              duration-300
            "
          >
            {section.buttonText || "Explore AgriTech"}
            {isExternal ? (
              <ExternalLink
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            ) : (
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            )}
          </ButtonComponent>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="
            relative
            bg-white/5
            border
            border-white/10
            backdrop-blur-xl
            rounded-[2rem]
            p-6
            shadow-2xl
            overflow-hidden
          "
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-70" />

          <div className="relative z-10 flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
              <PanelIcon size={28} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">
                {section.panelTitle || ""}
              </h3>

              <p className="text-sm text-gray-300">
                {section.panelSubtitle || ""}
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            {features.map((feature) => {
              const FeatureIcon = getCtaIcon(feature.iconKey);

              return (
                <motion.div
                  key={feature._id || feature.id}
                  whileHover={{ x: 4 }}
                  className="
                    flex
                    items-center
                    gap-3
                    bg-white/5
                    hover:bg-white/10
                    border
                    border-white/10
                    rounded-2xl
                    px-4
                    py-3
                    transition-all
                    duration-300
                  "
                >
                  <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                    <FeatureIcon size={18} />
                  </div>

                  <span className="text-white font-medium text-sm">
                    {feature.title || ""}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomepageCtaSection;

