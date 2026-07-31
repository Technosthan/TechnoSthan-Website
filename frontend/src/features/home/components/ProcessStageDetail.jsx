import { forwardRef } from "react";
import { FiArrowLeft, FiArrowRight, FiLayers } from "react-icons/fi";

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const ProcessStageDetail = forwardRef(function ProcessStageDetail(
  {
    stage,
    stageCount,
    activeIndex,
    onPrevious,
    onNext,
    onCta,
    services = [],
    project = null,
  },
  ref
) {
  const StageIcon = stage.icon || FiLayers;

  if (!stage) {
    return null;
  }

  return (
    <article className="why-detail-panel" ref={ref} aria-live="polite">
      <div className="why-detail-panel__top" data-why-detail-reveal>
        <span className="why-detail-panel__eyebrow">Stage {stage.number}</span>
        <span className="why-detail-panel__state">
          Step {activeIndex + 1} of {stageCount}
        </span>
      </div>

      <div className="why-detail-panel__header" data-why-detail-reveal>
        <span className="why-detail-panel__icon" aria-hidden="true">
          <StageIcon size={18} />
        </span>
        <div>
          <h3>{stage.title}</h3>
          <p>{stage.summary}</p>
        </div>
      </div>

      <div className="why-detail-panel__copy" data-why-detail-reveal>
        <p>{stage.description}</p>
      </div>

      <ul className="why-detail-panel__points" data-why-detail-reveal>
        {stage.points.slice(0, 4).map((point) => (
          <li key={point}>
            <span aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {(services.length > 0 || project) && (
        <div className="why-detail-panel__context" data-why-detail-reveal>
          {services.map((service) => (
            <span key={service.key} className="why-detail-panel__chip" title={service.shortDescription}>
              {normalizeText(service.title, "Enterprise capability")}
            </span>
          ))}
          {project ? (
            <span className="why-detail-panel__chip why-detail-panel__chip--project">
              <FiLayers size={12} />
              <span>Recent work: {project.title}</span>
            </span>
          ) : null}
        </div>
      )}

      <div className="why-detail-panel__actions" data-why-detail-reveal>
        <button type="button" className="why-detail-panel__nav" onClick={onPrevious}>
          <FiArrowLeft size={16} />
          Previous
        </button>
        <button type="button" className="why-detail-panel__nav why-detail-panel__nav--primary" onClick={onCta}>
          Start the conversation
          <FiArrowRight size={16} />
        </button>
        <button type="button" className="why-detail-panel__nav" onClick={onNext}>
          Next
          <FiArrowRight size={16} />
        </button>
      </div>
    </article>
  );
});

export default ProcessStageDetail;
