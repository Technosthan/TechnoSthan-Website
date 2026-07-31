import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiHeadphones, FiShield, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { PROCESS_STEPS } from "./ProcessWheel";
import ProcessWheel6D from "./ProcessWheel6D";
import ProcessStageDetail from "./ProcessStageDetail";
import "../styles/process-wheel-6d.css";

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const STAGE_LABELS = [
  "Discovery",
  "Discuss / Planning",
  "Design",
  "Development",
  "Debugging / Testing",
  "Deployment",
];

const STAGE_SUMMARIES = [
  "We clarify goals, constraints, and outcomes before the work begins.",
  "We align scope, stakeholders, and delivery rhythm into one plan.",
  "We turn the brief into clear flows, interfaces, and system boundaries.",
  "We build in small, reviewed increments that stay easy to extend.",
  "We check quality, accessibility, and stability before release.",
  "We coordinate release, monitoring, and handover so launch feels calm.",
];

const STAGE_POINTS = [
  [
    "Stakeholders and decision paths stay visible from the start.",
    "Constraints are surfaced before they slow delivery.",
    "Success criteria are agreed before the first sprint begins.",
  ],
  [
    "Roadmaps are sequenced around real delivery constraints.",
    "Architecture and integration choices are mapped early.",
    "Communication stays predictable while the plan evolves.",
  ],
  [
    "Interface logic is shaped around real user needs.",
    "Information architecture stays easy to follow.",
    "Design handoff remains clear for engineering teams.",
  ],
  [
    "Implementation moves in small verified steps.",
    "Reusable patterns stay easy to extend and maintain.",
    "Quality is tied to build decisions, not a final pass.",
  ],
  [
    "Functional checks run before release decisions are made.",
    "Accessibility and performance are reviewed together.",
    "Issues are resolved while change is still cheap.",
  ],
  [
    "Release checklists reduce rollout noise.",
    "Monitoring is ready before the switch flips.",
    "Stakeholder handover stays calm and documented.",
  ],
];

const TRUST_MODULES = [
  {
    icon: FiUsers,
    title: "Clear communication",
    text: "Delivery stays visible so stakeholders know what is happening and what comes next.",
  },
  {
    icon: FiShield,
    title: "Secure engineering",
    text: "Architecture and implementation choices are shaped with reliability and control in mind.",
  },
  {
    icon: FiTrendingUp,
    title: "Scalable architecture",
    text: "Systems are designed to grow without losing structure, clarity, or maintainability.",
  },
  {
    icon: FiHeadphones,
    title: "Long-term support",
    text: "Support stays connected after launch so the work remains stable and useful.",
  },
];

const buildStageData = () =>
  PROCESS_STEPS.slice(0, 6).map((step, index) => ({
    key: `why-stage-${index + 1}`,
    number: String(index + 1).padStart(2, "0"),
    title: normalizeText(STAGE_LABELS[index], step?.title || `Stage ${index + 1}`),
    summary: normalizeText(STAGE_SUMMARIES[index], step?.description || ""),
    description: normalizeText(step?.description, STAGE_SUMMARIES[index]),
    points: STAGE_POINTS[index],
    icon: step?.icon,
    shortLabel: normalizeText(step?.title, STAGE_LABELS[index]),
  }));

const EditorialWhy = ({ services, projects }) => {
  const navigate = useNavigate();
  const scopeRef = useRef(null);
  const detailRef = useRef(null);
  const wheelRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const pointerInsideRef = useRef(false);
  const focusInsideRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const stages = useMemo(() => buildStageData(), []);
  const activeStage = stages[activeIndex] || stages[0];
  const liveServices = useMemo(() => {
    return (services || [])
      .filter((service) => service?.isActive !== false)
      .sort(
        (a, b) =>
          Number(a?.displayOrder || 0) - Number(b?.displayOrder || 0) ||
          String(a?.title || "").localeCompare(String(b?.title || ""))
      )
      .slice(0, 3)
      .map((service, index) => ({
        key: service.id || `${service.title}-${index}`,
        title: normalizeText(service.title, "Enterprise capability"),
        shortDescription: normalizeText(
          service.shortDescription || service.description,
          "Live service capability."
        ),
      }));
  }, [services]);

  const recentProject = useMemo(() => {
    const project = (projects || []).find(Boolean);

    if (!project) {
      return null;
    }

    return {
      title: normalizeText(project.title, "Selected work"),
      category: normalizeText(project.category, "Enterprise project"),
    };
  }, [projects]);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const pauseRotation = useCallback(() => {
    clearResumeTimer();
    wheelRef.current?.pause?.();
  }, [clearResumeTimer]);

  const queueResume = useCallback(
    (delay = 800) => {
      clearResumeTimer();

      if (reducedMotion) {
        return;
      }

      resumeTimerRef.current = window.setTimeout(() => {
        if (!pointerInsideRef.current && !focusInsideRef.current) {
          wheelRef.current?.resume?.();
        }
      }, delay);
    },
    [clearResumeTimer, reducedMotion]
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseRotation();
        return;
      }

      if (!reducedMotion) {
        queueResume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearResumeTimer();
    };
  }, [pauseRotation, queueResume, clearResumeTimer, reducedMotion]);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-why-reveal]"),
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    { scope: scopeRef, dependencies: [reducedMotion] }
  );

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !detailRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const targets = detailRef.current.querySelectorAll("[data-why-detail-reveal]");

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.05,
            ease: "power2.out",
          }
        );
      }, detailRef);

      return () => context.revert();
    },
    { scope: detailRef, dependencies: [activeIndex, reducedMotion] }
  );

  const handleStageChange = (index) => {
    const nextIndex = (index + stages.length) % stages.length;
    setActiveIndex(nextIndex);
  };

  const handleStageSelect = (index) => {
    pauseRotation();
    handleStageChange(index);
    queueResume(2400);
  };

  const handleStageKeyDown = (event, index) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        handleStageChange(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        handleStageChange(index - 1);
        break;
      case "Home":
        event.preventDefault();
        handleStageChange(0);
        break;
      case "End":
        event.preventDefault();
        handleStageChange(stages.length - 1);
        break;
      default:
        break;
    }
  };

  if (!activeStage) {
    return null;
  }

  return (
    <section
      className="why-process-section"
      ref={scopeRef}
      onMouseEnter={() => {
        pointerInsideRef.current = true;
        pauseRotation();
        clearResumeTimer();
      }}
      onMouseLeave={() => {
        pointerInsideRef.current = false;
        queueResume();
      }}
      onFocusCapture={() => {
        focusInsideRef.current = true;
        pauseRotation();
        clearResumeTimer();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focusInsideRef.current = false;
          queueResume();
        }
      }}
    >
      <div className="why-process-container">
        <header className="why-process-header" data-why-reveal>
          <span className="why-process-eyebrow">OUR 6D PROCESS</span>
          <h2>From discovery to deployment, one connected delivery system.</h2>
          <p>
            TechnoSthan follows a structured six-stage process to plan, design,
            build, test, deploy and scale reliable digital products.
          </p>
        </header>

        <div className="why-process-content">
          <div className="why-process-wheel-column">
            <ProcessWheel6D
              ref={wheelRef}
              stages={stages}
              activeIndex={activeIndex}
              onStageSelect={handleStageSelect}
              onStageSync={handleStageChange}
              onStageKeyDown={handleStageKeyDown}
              reducedMotion={reducedMotion}
            />
          </div>

          <div className="why-process-detail-column">
            <ProcessStageDetail
              ref={detailRef}
              stage={activeStage}
              stageCount={stages.length}
              activeIndex={activeIndex}
              onPrevious={() => handleStageSelect(activeIndex - 1)}
              onNext={() => handleStageSelect(activeIndex + 1)}
              onCta={() => navigate("/contact")}
              services={liveServices}
              project={recentProject}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        <div className="why-process-trust" data-why-reveal>
          {TRUST_MODULES.map((module) => {
            const Icon = module.icon;

            return (
              <article key={module.title} className="why-process-trust__item">
                <span className="why-process-trust__icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <div>
                  <strong>{module.title}</strong>
                  <p>{module.text}</p>
                </div>
              </article>
            );
          })}

          <button
            type="button"
            className="why-process-trust__cta"
            onClick={() => navigate("/contact")}
          >
            Start the conversation
            <FiArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default EditorialWhy;
