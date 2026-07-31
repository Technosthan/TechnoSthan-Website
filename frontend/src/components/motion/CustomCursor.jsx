import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { gsap } from "../../lib/gsapSetup";
import useReducedMotion from "../../lib/useReducedMotion";
import { useAppMotion } from "../../providers/AppMotionProvider";

const getCursorState = (target) => {
  const interactive = target?.closest?.(
    "[data-cursor], [data-magnetic], a, button, [role='button'], img, .card, .service-card, .product-card, .team-card, .feature-card"
  );
  if (interactive) {
    return interactive.getAttribute("data-cursor") || "link";
  }

  if (target?.closest?.("input, textarea, select, [contenteditable='true']")) {
    return "hidden";
  }

  if (target?.closest?.("a, button, [role='button']")) {
    return "link";
  }

  return "default";
};

const CURSOR_LABELS = {
  default: "",
  link: "VIEW",
  view: "VIEW",
  open: "OPEN",
  drag: "DRAG",
};

const CustomCursor = () => {
  const reducedMotion = useReducedMotion();
  const location = useLocation();
  const { isAppReady } = useAppMotion();
  const cursorRef = useRef(null);
  const moveFrame = useRef(0);
  const cursorStateRef = useRef("default");
  const [cursorState, setCursorState] = useState("default");

  const visible = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches &&
      !reducedMotion &&
      !location.pathname.startsWith("/admin")
    );
  }, [location.pathname, reducedMotion]);

  useEffect(() => {
    if (!visible || !isAppReady) {
      document.body.classList.remove("has-premium-cursor");
      return undefined;
    }

    document.body.classList.add("has-premium-cursor");
    const cursorEl = cursorRef.current;

    const toCursorX = gsap.quickTo(cursorEl, "x", {
      duration: 0.18,
      ease: "power3.out",
    });
    const toCursorY = gsap.quickTo(cursorEl, "y", {
      duration: 0.18,
      ease: "power3.out",
    });

    const setState = (nextState) => {
      if (!cursorEl || cursorStateRef.current === nextState) {
        return;
      }

      cursorStateRef.current = nextState;
      setCursorState(nextState);
      cursorEl.dataset.state = nextState;
    };

    const updatePosition = (event) => {
      if (moveFrame.current) {
        return;
      }

      const nextX = event.clientX;
      const nextY = event.clientY;

      moveFrame.current = window.requestAnimationFrame(() => {
        moveFrame.current = 0;
        toCursorX(nextX);
        toCursorY(nextY);
      });
    };

    const onPointerMove = (event) => {
      updatePosition(event);
      setState(getCursorState(event.target));
    };

    const onPointerLeave = () => setState("default");
    const onBlur = () => setState("default");

    const onPointerDown = (event) => {
      if (getCursorState(event.target) === "drag") {
        setState("drag");
      }
    };

    const onPointerUp = (event) => {
      setState(getCursorState(event.target));
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("blur", onBlur);
      document.body.classList.remove("has-premium-cursor");
      gsap.killTweensOf([cursorEl]);

      if (moveFrame.current) {
        window.cancelAnimationFrame(moveFrame.current);
      }
    };
  }, [isAppReady, visible]);

  if (!visible || !isAppReady) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      aria-hidden="true"
      data-custom-cursor
      data-state={cursorState}
    >
      <span className="custom-cursor-ring" aria-hidden="true" />
      <span className="custom-cursor-dot" aria-hidden="true" />
      <span className="custom-cursor-label" aria-hidden="true">
        {CURSOR_LABELS[cursorState] || ""}
      </span>
    </div>
  );
};

export default CustomCursor;
