import { useEffect, useState } from "react";
import {
  getPublicHomepageCtaSections,
  HOMEPAGE_CTA_SECTIONS_CHANGED_EVENT,
  homepageCtaSectionsStorageKey,
} from "../features/homepageCtaSections/homepageCtaSectionsApi";
import HomepageCtaSection from "./HomepageCtaSection";

const ContactSection = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSections = async () => {
      try {
        setLoading(true);
        const response = await getPublicHomepageCtaSections();
        if (cancelled) return;
        setSections(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        if (!cancelled) {
          console.error("[ContactSection] failed to load CTA sections:", error.message);
          setSections([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSections();

    const handleHomepageCtaSectionsChanged = () => {
      loadSections();
    };

    const handleStorageChange = (event) => {
      if (event.key === homepageCtaSectionsStorageKey) {
        loadSections();
      }
    };

    window.addEventListener(HOMEPAGE_CTA_SECTIONS_CHANGED_EVENT, handleHomepageCtaSectionsChanged);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      cancelled = true;
      window.removeEventListener(
        HOMEPAGE_CTA_SECTIONS_CHANGED_EVENT,
        handleHomepageCtaSectionsChanged,
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <section className="relative py-14 px-5 md:px-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-60 h-60 bg-green-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="relative max-w-6xl mx-auto rounded-[2.2rem] overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#052e16] to-[#064e3b] border border-white/10 shadow-2xl animate-pulse">
          <div className="grid lg:grid-cols-2 items-center gap-8 px-6 md:px-10 py-10 md:py-12">
            <div>
              <div className="h-10 w-11/12 max-w-lg rounded-2xl bg-white/10 mb-5" />
              <div className="h-5 w-full max-w-xl rounded bg-white/10 mb-3" />
              <div className="h-5 w-5/6 max-w-lg rounded bg-white/10 mb-8" />
              <div className="h-12 w-44 rounded-2xl bg-green-500/60" />
            </div>
            <div className="relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl overflow-hidden">
              <div className="h-14 w-14 rounded-2xl bg-white/10 mb-6" />
              <div className="h-8 w-2/3 rounded bg-white/10 mb-2" />
              <div className="h-4 w-1/2 rounded bg-white/10 mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-14 rounded-2xl bg-white/5 border border-white/10" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="relative py-14 px-5 md:px-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-60 h-60 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative space-y-10">
        {sections.map((section, index) => (
          <HomepageCtaSection key={section._id || section.id || index} section={section} />
        ))}
      </div>
    </section>
  );
};

export default ContactSection;
