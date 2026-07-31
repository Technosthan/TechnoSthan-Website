import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { FiCircle } from "react-icons/fi";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { getIconComponent } from "../../../shared/utils";

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const parseMetricValue = (value) => {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const match = text.match(/(-?\d[\d,]*(?:\.\d+)?)/);

  if (!match) {
    return null;
  }

  const numericPart = match[1].replace(/,/g, "");
  const numeric = Number(numericPart);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  const start = match.index ?? 0;
  const prefix = text.slice(0, start);
  const suffix = text.slice(start + match[1].length);
  const cleanDigits = numericPart.replace(/^-/, "");
  const padLength =
    !prefix && !suffix && /^0\d+$/.test(cleanDigits) ? cleanDigits.length : 0;
  const decimals = numericPart.includes(".")
    ? numericPart.split(".")[1].length
    : 0;

  return {
    prefix,
    suffix,
    numeric,
    padLength,
    decimals,
  };
};

const formatMetricValue = (value, meta) => {
  if (!meta) {
    return String(value ?? "");
  }

  const displayValue =
    meta.decimals > 0
      ? Number(value).toFixed(meta.decimals)
      : String(Math.round(value));
  const digits = !meta.decimals && meta.padLength > 0
    ? displayValue.padStart(meta.padLength, "0")
    : displayValue;

  return `${meta.prefix}${digits}${meta.suffix}`;
};

const normalizeMetric = (metric, index) => {
  const label = normalizeText(metric?.label);
  const description = normalizeText(metric?.description || metric?.details);
  const rawValue =
    metric?.value ?? metric?.number ?? metric?.count ?? metric?.metricValue;
  const valueMeta = parseMetricValue(rawValue);

  if (!label || !valueMeta) {
    return null;
  }

  return {
    key: metric?.key || metric?.id || `${label}-${index}`,
    label,
    description,
    order: Number.isFinite(Number(metric?.order ?? metric?.displayOrder))
      ? Number(metric?.order ?? metric?.displayOrder)
      : index,
    featured: Boolean(metric?.featured ?? metric?.isFeatured ?? metric?.highlighted),
    iconKey: normalizeText(metric?.iconKey || metric?.iconName || ""),
    rawValue,
    valueMeta,
  };
};

const renderMetricNumber = (metric) => {
  const Icon = metric.iconKey ? getIconComponent(metric.iconKey) : FiCircle;

  return (
    <div className="editorial-stat-valueRow">
      <strong className="editorial-stat-value">
        <span data-stat-count data-stat-meta={JSON.stringify(metric.valueMeta)}>
          {formatMetricValue(0, metric.valueMeta)}
        </span>
      </strong>
      <span className="editorial-stat-icon" aria-hidden="true">
        <Icon size={15} />
      </span>
    </div>
  );
};

const EditorialStats = ({ stats }) => {
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const hasAnimatedRef = useRef(false);

  const metrics = useMemo(() => {
    const normalized = (stats || [])
      .map(normalizeMetric)
      .filter(Boolean)
      .sort((a, b) => a.order - b.order);

    return normalized;
  }, [stats]);

  const featuredMetric =
    metrics.find((metric) => metric.featured) || metrics[0] || null;
  const supportingMetrics = featuredMetric
    ? metrics.filter((metric) => metric.key !== featuredMetric.key)
    : [];

  useGSAP(
    () => {
      setupGsap();

      if (
        reducedMotion ||
        !scopeRef.current ||
        metrics.length === 0 ||
        hasAnimatedRef.current
      ) {
        return undefined;
      }

      const context = gsap.context(() => {
        const revealTargets = scopeRef.current.querySelectorAll("[data-stat-reveal]");
        const countTargets = scopeRef.current.querySelectorAll("[data-stat-count]");

        const animateCounts = () => {
          if (hasAnimatedRef.current) {
            return;
          }

          hasAnimatedRef.current = true;

          countTargets.forEach((target) => {
            const meta = JSON.parse(target.getAttribute("data-stat-meta") || "null");

            if (!meta) {
              return;
            }

            const counter = { value: 0 };
            const formatValue = (nextValue) => {
              const roundedValue =
                meta.decimals > 0
                  ? Number(nextValue).toFixed(meta.decimals)
                  : Math.round(nextValue);
              const digits =
                meta.decimals > 0
                  ? String(roundedValue)
                  : meta.padLength > 0
                    ? String(roundedValue).padStart(meta.padLength, "0")
                    : String(roundedValue);

              target.textContent = `${meta.prefix}${digits}${meta.suffix}`;
            };

            gsap.to(counter, {
              value: meta.numeric,
              duration: 1.35,
              ease: "power3.out",
              snap: meta.decimals > 0 ? false : { value: 1 },
              onUpdate: () => formatValue(counter.value),
              onComplete: () => formatValue(meta.numeric),
            });
          });
        };

        gsap.fromTo(
          revealTargets,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 82%",
              once: true,
              onEnter: animateCounts,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    {
      scope: scopeRef,
      dependencies: [metrics, reducedMotion],
    }
  );

  if (metrics.length === 0 || !featuredMetric) {
    return null;
  }

  return (
    <section className="editorial-stats" ref={scopeRef} data-motion-zone="statistics">
      <div className="editorial-shell editorial-stats-shell">
        <header className="editorial-stats-intro" data-stat-reveal>
          <span className="editorial-kicker">Business Impact</span>
          <h2>Enterprise metrics, framed as delivery proof.</h2>
          <p>
            Only real CMS-backed counts are surfaced here. The strongest signal is
            highlighted automatically, and anything missing stays hidden.
          </p>
        </header>

        <div
          className={`editorial-stats-layout ${
            supportingMetrics.length === 0 ? "editorial-stats-layout--solo" : ""
          }`}
        >
          <div className="editorial-stats-stage">
            <div className="editorial-stats-decor" aria-hidden="true">
              <svg
                className="editorial-stats-network"
                viewBox="0 0 1200 900"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="editorial-stats-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="rgba(45, 212, 200, 0.06)" />
                    <stop offset="52%" stopColor="rgba(74, 141, 255, 0.32)" />
                    <stop offset="100%" stopColor="rgba(239, 91, 42, 0.18)" />
                  </linearGradient>
                </defs>
                <path d="M 58 152 C 170 120, 284 170, 382 132 S 580 88, 706 178 S 936 290, 1140 196" />
                <path d="M 92 712 C 204 640, 312 736, 426 666 S 628 574, 744 632 S 982 732, 1132 620" />
                <path d="M 220 82 C 280 200, 246 320, 322 432 S 496 594, 436 742" />
                <g>
                  <circle cx="58" cy="152" r="7" />
                  <circle cx="382" cy="132" r="10" />
                  <circle cx="706" cy="178" r="8" />
                  <circle cx="1140" cy="196" r="7" />
                  <circle cx="92" cy="712" r="7" />
                  <circle cx="426" cy="666" r="9" />
                  <circle cx="744" cy="632" r="8" />
                  <circle cx="1132" cy="620" r="7" />
                </g>
              </svg>
            </div>

            <article
              className="editorial-stat editorial-stat--featured"
              data-stat-card
              data-stat-reveal
              data-motion-focus="stat"
            >
              <div className="editorial-stat-header">
                <span className="editorial-stat-chip">Primary proof</span>
                <span className="editorial-stat-indicator" aria-hidden="true" />
              </div>

              {renderMetricNumber(featuredMetric)}

              <div className="editorial-stat-copy">
                <h3>{featuredMetric.label}</h3>
                {featuredMetric.description ? (
                  <p>{featuredMetric.description}</p>
                ) : null}
              </div>
            </article>
          </div>

          {supportingMetrics.length > 0 ? (
            <div className="editorial-stats-support">
              {supportingMetrics.map((metric) => (
                <article
                  key={metric.key}
                  className="editorial-stat editorial-stat--compact"
                  data-stat-card
                  data-stat-reveal
                  data-motion-focus="stat"
                >
                  <div className="editorial-stat-header">
                    <span className="editorial-stat-chip">Supporting signal</span>
                    <span className="editorial-stat-indicator" aria-hidden="true" />
                  </div>

                  {renderMetricNumber(metric)}

                  <div className="editorial-stat-copy">
                    <h3>{metric.label}</h3>
                    {metric.description ? <p>{metric.description}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default EditorialStats;
