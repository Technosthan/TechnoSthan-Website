import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { ArrowRight } from "lucide-react";
import { getPublicEmpoweringCards } from "../features/empoweringCards/empoweringCardsApi";
import {
  getCardIcon,
  isSafeCardButtonLink,
} from "../features/empoweringCards/empoweringCards.utils";

const DEFAULT_EMPOWERING_CARDS = [
  {
    id: "default-1",
    title: "Smart Farming",
    description: "Modern agricultural solutions",
    mediaType: "image",
    mediaUrl: "/optimized/farmer1-1536.jpg",
    thumbnailUrl: "",
    iconKey: "tractor",
    buttonText: "Learn More",
    buttonLink: "#",
    openInNewTab: false,
    displayOrder: 0,
  },
  {
    id: "default-2",
    title: "Smart Farming",
    description: "Modern agricultural solutions",
    mediaType: "image",
    mediaUrl: "/optimized/farmer2-1536.jpg",
    thumbnailUrl: "",
    iconKey: "tractor",
    buttonText: "Learn More",
    buttonLink: "#",
    openInNewTab: false,
    displayOrder: 1,
  },
  {
    id: "default-3",
    title: "Smart Farming",
    description: "Modern agricultural solutions",
    mediaType: "image",
    mediaUrl: "/optimized/farmer3-1536.jpg",
    thumbnailUrl: "",
    iconKey: "tractor",
    buttonText: "Learn More",
    buttonLink: "#",
    openInNewTab: false,
    displayOrder: 2,
  },
];

const AboutSection = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef(new Map());

  useEffect(() => {
    let cancelled = false;

    const loadCards = async () => {
      try {
        setLoading(true);
        const response = await getPublicEmpoweringCards();
        if (cancelled) return;
        setCards(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        if (cancelled) return;
        console.error("[AboutSection] failed to load empowering cards:", error.message);
        setCards([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCards();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedCards = useMemo(() => {
    const sourceCards = cards.length > 0 ? cards : DEFAULT_EMPOWERING_CARDS;
    return [...sourceCards].sort(
      (a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0),
    );
  }, [cards]);

  useEffect(() => {
    if (reduceMotion) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!(video instanceof HTMLVideoElement)) return;

          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise?.catch) {
              playPromise.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 },
    );

    videoRefs.current.forEach((video) => {
      if (video instanceof HTMLVideoElement) {
        observer.observe(video);
      }
    });

    return () => observer.disconnect();
  }, [reduceMotion, sortedCards]);

  const setVideoRef = (cardId) => (node) => {
    if (node) {
      videoRefs.current.set(cardId, node);
      return;
    }

    videoRefs.current.delete(cardId);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative py-20 px-6 md:px-12"
      >
        <div className="text-center mb-14">
          <h2 className={`text-4xl md:text-5xl font-black mb-5 ${theme.text}`}>
            {t("home.aboutSection.titleLine1")}
            <br />
            <span className={theme.accent}>{t("home.aboutSection.titleLine2")}</span>
          </h2>

          <p className={`max-w-3xl mx-auto text-lg leading-relaxed ${theme.textSecondary}`}>
            {t("home.aboutSection.subtitle")}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[2rem] shadow-2xl border border-white/10 bg-white/30 animate-pulse"
              >
                <div className="h-[420px] w-full bg-gradient-to-br from-white/50 to-emerald-100/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="h-12 w-12 rounded-xl bg-white/20 mb-3" />
                  <div className="h-5 w-2/3 rounded bg-white/20" />
                  <div className="mt-2 h-4 w-full rounded bg-white/15" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-white/15" />
                  <div className="mt-4 h-4 w-28 rounded bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sortedCards.map((card) => {
              const CardIcon = getCardIcon(card.iconKey);
              const safeLink = isSafeCardButtonLink(card.buttonLink);
              const Wrapper = safeLink ? "a" : "div";
              const wrapperProps = safeLink
                ? {
                    href: card.buttonLink,
                    target: card.openInNewTab ? "_blank" : "_self",
                    rel: card.openInNewTab ? "noreferrer" : undefined,
                  }
                : {};

              return (
                <motion.div
                  key={card.id || card._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-[2rem] shadow-2xl border border-white/10"
                >
                  {card.mediaType === "video" ? (
                    <video
                      ref={setVideoRef(card.id || card._id)}
                      src={card.mediaUrl}
                      poster={card.thumbnailUrl || undefined}
                      muted
                      loop
                      playsInline
                      autoPlay={!reduceMotion}
                      preload="metadata"
                      aria-label={card.title}
                      className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <img
                      src={card.mediaUrl}
                      alt={card.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                        <CardIcon size={22} />
                      </div>

                      <div>
                        <h3 className="text-white font-bold text-lg">{card.title}</h3>
                        <p className="text-gray-200 text-sm">{card.description}</p>
                      </div>
                    </div>

                    <Wrapper
                      {...wrapperProps}
                      className="inline-flex items-center text-green-300 font-medium text-sm"
                    >
                      {card.buttonText || t("home.aboutSection.learnMore")}
                      <ArrowRight
                        size={16}
                        className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </Wrapper>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-7xl text-center text-slate-500" />
        )}
      </motion.section>
    </section>
  );
};

export default AboutSection;
