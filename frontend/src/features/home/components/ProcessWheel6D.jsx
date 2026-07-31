import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import ProcessStageNode from "./ProcessStageNode";

const FULL_CIRCLE = 360;
const TOP_ANGLE = -90;
const ROTATION_DURATION = 30;

/**
 * Angle ko -180 se 180 ke beech normalize karta hai.
 */
const normalizeAngle = (angle) => {
  let normalized = angle % FULL_CIRCLE;

  if (normalized > 180) {
    normalized -= FULL_CIRCLE;
  }

  if (normalized < -180) {
    normalized += FULL_CIRCLE;
  }

  return normalized;
};

/**
 * Wheel par stage ki circular position calculate karta hai.
 */
const getCircularPoint = (
  stageIndex,
  totalStages,
  rotationAngle,
  radius,
  centerX,
  centerY,
) => {
  const stepAngle = FULL_CIRCLE / totalStages;

  const angle = TOP_ANGLE + stageIndex * stepAngle + rotationAngle;

  const radians = (angle * Math.PI) / 180;

  return {
    angle,
    x: centerX + Math.cos(radians) * radius,
    y: centerY + Math.sin(radians) * radius,
  };
};

/**
 * Top position ke sabse paas ka stage find karta hai.
 */
const getTopStageIndex = (totalStages, rotationAngle) => {
  if (!totalStages) {
    return 0;
  }

  let closestIndex = 0;
  let smallestDifference = Infinity;

  for (let index = 0; index < totalStages; index += 1) {
    const stepAngle = FULL_CIRCLE / totalStages;

    const stageAngle = TOP_ANGLE + index * stepAngle + rotationAngle;

    const difference = Math.abs(normalizeAngle(stageAngle - TOP_ANGLE));

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestIndex = index;
    }
  }

  return closestIndex;
};

const ProcessWheel6D = forwardRef(function ProcessWheel6D(
  {
    stages = [],
    activeIndex = 0,
    onStageSelect,
    onStageKeyDown,
    reducedMotion = false,
  },
  ref,
) {
  const rootRef = useRef(null);
  const nodeRefs = useRef([]);

  const frameRef = useRef(0);
  const previousTimestampRef = useRef(0);
  const elapsedRef = useRef(0);
  const rotationRef = useRef(0);

  const manualPauseRef = useRef(false);
  const radiusHoverRef = useRef(false);
  const activeTopIndexRef = useRef(activeIndex);

  const dimensionsRef = useRef({
    width: 0,
    height: 0,
    radius: 0,
    centerX: 0,
    centerY: 0,
  });

  const [isVisible, setIsVisible] = useState(true);

  const [isTabVisible, setIsTabVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );

  const [isRadiusHovered, setIsRadiusHovered] = useState(false);

  const stopAnimation = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }

    previousTimestampRef.current = 0;
  }, []);

  const updateActiveStage = useCallback(
    (rotationAngle) => {
      if (!stages.length) {
        return;
      }

      const nextActiveIndex = getTopStageIndex(stages.length, rotationAngle);

      if (nextActiveIndex !== activeTopIndexRef.current) {
        activeTopIndexRef.current = nextActiveIndex;

        if (typeof onStageSelect === "function") {
          onStageSelect(nextActiveIndex);
        }
      }
    },
    [onStageSelect, stages.length],
  );

  const drawWheel = useCallback(
    (rotationAngle) => {
      const { centerX, centerY, radius } = dimensionsRef.current;

      if (!centerX || !centerY || !radius || !stages.length) {
        return;
      }

      stages.forEach((stage, index) => {
        const element = nodeRefs.current[index];

        if (!element) {
          return;
        }

        const point = getCircularPoint(
          index,
          stages.length,
          rotationAngle,
          radius,
          centerX,
          centerY,
        );

        element.style.setProperty("--node-x", `${point.x}px`);

        element.style.setProperty("--node-y", `${point.y}px`);

        const isTopStage =
          index === getTopStageIndex(stages.length, rotationAngle);

        element.style.setProperty("--node-scale", isTopStage ? "1.08" : "1");

        element.classList.toggle("is-top-stage", isTopStage);
      });

      updateActiveStage(rotationAngle);
    },
    [stages, updateActiveStage],
  );

  const animationTick = useCallback(
    (timestamp) => {
      if (!previousTimestampRef.current) {
        previousTimestampRef.current = timestamp;
      }

      const deltaMilliseconds = timestamp - previousTimestampRef.current;

      previousTimestampRef.current = timestamp;

      const shouldPause =
        manualPauseRef.current ||
        radiusHoverRef.current ||
        reducedMotion ||
        !isVisible ||
        !isTabVisible;

      if (!shouldPause) {
        const degreesPerSecond = FULL_CIRCLE / ROTATION_DURATION;

        rotationRef.current += (deltaMilliseconds / 1000) * degreesPerSecond;

        rotationRef.current %= FULL_CIRCLE;

        elapsedRef.current += deltaMilliseconds / 1000;
      }

      drawWheel(rotationRef.current);

      frameRef.current = requestAnimationFrame(animationTick);
    },
    [drawWheel, isTabVisible, isVisible, reducedMotion],
  );

  const startAnimation = useCallback(() => {
    if (frameRef.current) {
      return;
    }

    previousTimestampRef.current = 0;

    frameRef.current = requestAnimationFrame(animationTick);
  }, [animationTick]);

  const syncWheelSize = useCallback(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const rect = root.getBoundingClientRect();

    const width = Math.max(1, rect.width);

    const height = Math.max(1, rect.height);

    const centerX = width / 2;
    const centerY = height / 2;

    /*
     * Node ka half-size minus karke
     * card ko wheel ke andar rakhta hai.
     */
    const safeEdgeSpace = width < 600 ? 64 : 82;

    const radius = Math.min(width, height) / 2 - safeEdgeSpace;

    dimensionsRef.current = {
      width,
      height,
      centerX,
      centerY,
      radius: Math.max(110, radius),
    };

    drawWheel(rotationRef.current);
  }, [drawWheel]);

  /**
   * Sirf circular ring/radius par hover detect karega.
   */
  const handleWheelPointerMove = useCallback((event) => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const rect = root.getBoundingClientRect();

    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const { centerX, centerY, radius } = dimensionsRef.current;

    const deltaX = pointerX - centerX;
    const deltaY = pointerY - centerY;

    const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    /*
     * Mouse circular wheel ke radius ke andar hai
     * to animation pause hogi.
     *
     * Thoda extra space process names/icons ke liye.
     */
    const nodeHoverSpace = rect.width < 600 ? 28 : 38;

    const isInsideWheelRadius = distanceFromCenter <= radius + nodeHoverSpace;

    if (radiusHoverRef.current !== isInsideWheelRadius) {
      radiusHoverRef.current = isInsideWheelRadius;

      setIsRadiusHovered(isInsideWheelRadius);

      if (!isInsideWheelRadius) {
        previousTimestampRef.current = 0;
      }
    }
  }, []);

  const handleWheelPointerLeave = useCallback(() => {
    radiusHoverRef.current = false;
    setIsRadiusHovered(false);

    previousTimestampRef.current = 0;
  }, []);

  const handleNodeHoverEnter = useCallback(() => {
    radiusHoverRef.current = true;
    setIsRadiusHovered(true);
  }, []);

  const handleNodeHoverLeave = useCallback(() => {
    radiusHoverRef.current = false;
    setIsRadiusHovered(false);

    // Resume par jump prevent karega
    previousTimestampRef.current = 0;
  }, []);

  useEffect(() => {
    syncWheelSize();

    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        syncWheelSize();
      });

      resizeObserver.observe(root);

      return () => {
        resizeObserver.disconnect();
      };
    }

    window.addEventListener("resize", syncWheelSize, { passive: true });

    return () => {
      window.removeEventListener("resize", syncWheelSize);
    };
  }, [syncWheelSize]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    handleVisibilityChange();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    startAnimation();

    return () => {
      stopAnimation();
    };
  }, [startAnimation, stopAnimation]);

  useEffect(() => {
    activeTopIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (reducedMotion) {
      rotationRef.current = 0;
      drawWheel(0);
    }
  }, [drawWheel, reducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      pause: () => {
        manualPauseRef.current = true;
      },

      resume: () => {
        manualPauseRef.current = false;
        previousTimestampRef.current = 0;
      },
    }),
    [],
  );

  useEffect(
    () => () => {
      stopAnimation();
    },
    [stopAnimation],
  );

  const activeStage = stages[activeIndex] || stages[0];

  if (!activeStage) {
    return null;
  }

  return (
    <div className="why-wheel-panel" data-why-reveal>
      <div
        ref={rootRef}
        className={`why-wheel why-wheel--single-orbit ${
          isRadiusHovered ? "is-radius-hovered" : ""
        } ${reducedMotion ? "is-static" : ""}`.trim()}
        onPointerMove={handleWheelPointerMove}
        onPointerLeave={handleWheelPointerLeave}
      >
        <div className="process-circle-track" aria-hidden="true">
          <span className="process-circle-track__outer" />
          <span className="process-circle-track__middle" />
          <span className="process-circle-track__inner" />
        </div>

        <div className="process-orbit-layer">
          {stages.map((stage, index) => (
            <ProcessStageNode
              key={stage.key || stage.title || index}
              ref={(element) => {
                nodeRefs.current[index] = element;
              }}
              stage={stage}
              index={index}
              active={index === activeIndex}
              completed={index < activeIndex}
              nodeCounterRotation="0deg"
              onActivate={onStageSelect}
              onKeyDown={onStageKeyDown}
              layout="orbit"
            />
          ))}
        </div>

        <div className="why-wheel__core" aria-live="polite">
          <div className="why-wheel__coreOrb" aria-hidden="true">
            <span className="why-wheel__coreOrbGlow" />
            <span className="why-wheel__coreOrbGrid" />
          </div>

          <span className="why-wheel__eyebrow">TECHNOSTHAN</span>

          <strong>6D PROCESS</strong>

          <p>
            Step {String(activeIndex + 1).padStart(2, "0")} of {stages.length}
          </p>

          <h3>{activeStage.title}</h3>

          <span className="why-wheel__coreCaption">
            {activeStage.shortLabel}
          </span>
        </div>
      </div>
    </div>
  );
});

export default ProcessWheel6D;
