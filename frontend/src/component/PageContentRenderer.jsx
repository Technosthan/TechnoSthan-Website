import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import "./PageContentRenderer.css";

const resolveInlineStyles = (section) => {
  if (section.themeType === "original") {
    return {
      background: "transparent",
      border: "none",
      borderRadius: 0,
      padding: 0,
      boxShadow: "none",
    };
  }

  return {
    background: "transparent",
    border: "none",
    borderRadius: 0,
    padding: 0,
    boxShadow: "none",
  };
};

const renderSectionContent = (content) => {
  return content.split(/\n{2,}/g).map((paragraph, index) => (
    <p key={index}>
      {paragraph.split(/\n/).reduce((elements, line, lineIndex) => {
        if (lineIndex > 0) {
          elements.push(<br key={`br-${index}-${lineIndex}`} />);
        }
        elements.push(line);
        return elements;
      }, [])}
    </p>
  ));
};

const PageContentRenderer = ({ route, position }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSections = async () => {
      try {
        setLoading(true);
        setError("");
        const normalizedRoute = route || "/";
        const { data } = await api.get(
          `/api/page-content?route=${encodeURIComponent(normalizedRoute)}`,
        );

        if (!isMounted) return;

        if (data.success) {
          setSections(Array.isArray(data.data) ? data.data : []);
        } else {
          setSections([]);
          setError(data.message || "Unable to load page content");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Unable to load page content sections", err);
        setSections([]);
        setError("Unable to load page content");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const refreshSections = () => {
      if (isMounted) loadSections();
    };

    const handleStorageRefresh = (event) => {
      if (event.key === "page-content-updated") refreshSections();
    };

    window.addEventListener("page-content-updated", refreshSections);
    window.addEventListener("storage", handleStorageRefresh);
    loadSections();

    return () => {
      isMounted = false;
      window.removeEventListener("page-content-updated", refreshSections);
      window.removeEventListener("storage", handleStorageRefresh);
    };
  }, [route]);

  const sortedSections = useMemo(() => {
    return [...sections]
      .filter((section) => {
        const sectionPosition = String(section.position || "").trim();
        return !position || sectionPosition === position;
      })
      .filter((section) => section.status !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [position, sections]);

  if (loading) return null;
  if (error || sortedSections.length === 0) return null;

  return (
    <>
      {sortedSections.map((section) => {
        const styles = resolveInlineStyles(section);
        const key = section._id || section.id;

        return (
          <section key={key} className="site-container container dynamic-section">
            <div
              className={`dynamic-section__card ${
                section.themeType === "original"
                  ? "dynamic-section__card--original"
                  : "dynamic-section__card--default"
              }`}
              style={styles}
            >
              {section.title ? (
                <h2 className="dynamic-section__title">{section.title}</h2>
              ) : null}

              {section.subtitle ? (
                <p className="dynamic-section__subtitle">{section.subtitle}</p>
              ) : null}

              {section.content ? (
                <div
                  className={`dynamic-section__body ${
                    section.themeType === "original" ? "preserve-format" : ""
                  }`}
                >
                  {renderSectionContent(section.content)}
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </>
  );
};

export default PageContentRenderer;
