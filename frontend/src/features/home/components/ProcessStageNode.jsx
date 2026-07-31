import { forwardRef } from "react";
import { FiArrowRight } from "react-icons/fi";

const ProcessStageNode = forwardRef(function ProcessStageNode(
  {
    stage,
    index,
    active,
    completed,
    nodeCounterRotation = "0deg",
    onActivate,
    onKeyDown,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    layout = "orbit",
  },
  ref,
) {
  const Icon = stage?.icon || FiArrowRight;

  const stageNumber =
    stage?.number || String(index + 1).padStart(2, "0");

  const handleClick = () => {
    if (typeof onActivate === "function") {
      onActivate(index);
    }
  };

  const handleKeyDown = (event) => {
    if (typeof onKeyDown === "function") {
      onKeyDown(event, index);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  if (layout === "compact") {
    return (
      <button
        ref={ref}
        type="button"
        className={`why-stage-pill ${
          active ? "is-active" : ""
        } ${completed ? "is-completed" : ""}`.trim()}
        aria-selected={active}
        aria-current={active ? "step" : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className="why-stage-pill__index">
          {stageNumber}
        </span>

        <span className="why-stage-pill__copy">
          <strong>{stage?.title}</strong>
          <span>{stage?.shortLabel}</span>
        </span>
      </button>
    );
  }

  return (
    <div
      ref={ref}
      className={`why-stage-node ${
        active ? "is-active" : ""
      } ${completed ? "is-completed" : ""}`.trim()}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocusCapture={onFocus}
      onBlurCapture={onBlur}
    >
      <div
        className="why-stage-node__motion"
        style={{
          "--node-counter-rotation": nodeCounterRotation,
        }}
      >
        <button
          type="button"
          role="tab"
          aria-label={`Select ${stage?.title || "process"} step`}
          aria-selected={active}
          aria-current={active ? "step" : undefined}
          className={`why-stage-node__card ${
            active ? "is-active" : ""
          } ${completed ? "is-completed" : ""}`.trim()}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <span className="why-stage-node__inner">
            <span className="why-stage-node__index">
              {stageNumber}
            </span>

            <span
              className="why-stage-node__icon"
              aria-hidden="true"
            >
              <Icon size={16} />
            </span>

            <span className="why-stage-node__title">
              {stage?.title}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
});

export default ProcessStageNode;