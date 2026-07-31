import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "../../animations/gsapSetup";
import useReducedMotion from "../../lib/useReducedMotion";
import { calculateOrbitLayout } from "../utils/orbit-layout";
import "./radial-action-menu.css";

const DEFAULT_ORBIT_RADIUS = 72;

const RadialActionMenu = ({
  menuKey,
  label,
  triggerLabel,
  items = [],
  activeMenu,
  setActiveMenu,
  triggerNode,
  onTriggerClick,
  triggerActionMode = "toggle",
  radius = DEFAULT_ORBIT_RADIUS,
  menuClassName = "",
  buttonClassName = "",
  itemClassName = "",
  ariaControls,
}) => {
  const reducedMotion = useReducedMotion();
  const [canHover, setCanHover] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const panelRef = useRef(null);
  const orbitLayerRef = useRef(null);
  const orbitTimelineRef = useRef(null);
  const introTimelineRef = useRef(null);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);

  const isOpen = activeMenu === menuKey;
  const isCompactLayout = !canHover;

  const menuId = useMemo(
    () => ariaControls || `radial-action-${menuKey}`,
    [ariaControls, menuKey],
  );

  const orbitLayout = useMemo(
    () =>
      calculateOrbitLayout(items, {
        itemSize: 36,
        minimumGap: 12,
        baseRadius: radius,
        maximumRadius: 96,
        minimumRadius: 64,
        startAngle: -110,
        viewportWidth,
        centerOffsetX: 0,
        centerOffsetY: 0,
      }),
    [items, radius, viewportWidth],
  );

  const effectiveRadius = orbitLayout.radius;
  const menuSize = orbitLayout.menuSize;
  const orbitItems = orbitLayout.orbitItems;

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const toTargetList = (...targets) =>
    targets.flatMap((target) => {
      if (!target) {
        return [];
      }

      return typeof target.length === "number" && !target.nodeType
        ? Array.from(target).filter(Boolean)
        : [target];
    });

  const pauseOrbit = () => {
    if (reducedMotion || isCompactLayout) {
      return;
    }

    orbitTimelineRef.current?.pause();
  };

  const resumeOrbit = () => {
    if (reducedMotion || isCompactLayout || !isOpen || isClosingRef.current) {
      return;
    }

    orbitTimelineRef.current?.resume();
  };

  const openMenu = () => {
    clearCloseTimer();
    isClosingRef.current = false;

    if (orbitTimelineRef.current) {
      orbitTimelineRef.current.resume();
    }

    setActiveMenu?.(menuKey);
  };

  const closeMenu = (delay = 160) => {
    clearCloseTimer();
    isClosingRef.current = true;

    closeTimerRef.current = window.setTimeout(() => {
      setActiveMenu?.(null);
    }, delay);
  };

  useEffect(() => {
    const media = window.matchMedia?.("(hover: hover) and (pointer: fine)");

    const update = () => {
      setCanHover(Boolean(media?.matches));
    };

    update();

    media?.addEventListener?.("change", update);

    return () => {
      media?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    clearCloseTimer();

    const menu = menuRef.current;
    const panel = panelRef.current;
    const guide = panel?.querySelector(".nav-radial-guide");
    const orbitLayer = orbitLayerRef.current;
    const itemsEls = panel?.querySelectorAll("[data-radial-item]");
    const innerEls = panel?.querySelectorAll("[data-radial-item-inner]");

    const context = gsap.context(() => {
      if (!menu || !panel) {
        return;
      }

      if (!isOpen) {
        if (reducedMotion || isCompactLayout) {
          gsap.set(menu, {
            autoAlpha: 0,
            pointerEvents: "none",
          });
          gsap.set(panel, {
            autoAlpha: 0,
            scale: 0.96,
          });

          const hiddenTargets = toTargetList(guide, itemsEls);
          if (hiddenTargets.length > 0) {
            gsap.set(hiddenTargets, {
              autoAlpha: 0,
              scale: 0.62,
            });
          }

          orbitTimelineRef.current?.pause();
          isClosingRef.current = false;
          return;
        }

        if (!isClosingRef.current) {
          gsap.set(menu, {
            autoAlpha: 0,
            pointerEvents: "none",
          });
          orbitTimelineRef.current?.pause();
          return;
        }

        const closeTl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            gsap.set(menu, {
              autoAlpha: 0,
              pointerEvents: "none",
            });
            orbitTimelineRef.current?.pause();
            isClosingRef.current = false;
          },
        });

        closeTl
          .to(
            itemsEls,
            {
              autoAlpha: 0,
              scale: 0.62,
              duration: 0.16,
              stagger: 0.02,
            },
            0,
          )
          .to(
            guide,
            {
              autoAlpha: 0,
              scale: 0.92,
              duration: 0.16,
            },
            0,
          )
          .to(
            panel,
            {
              autoAlpha: 0,
              scale: 0.96,
              duration: 0.18,
            },
            0.02,
          );

        introTimelineRef.current?.kill();
        introTimelineRef.current = null;
        return;
      }

      isClosingRef.current = false;
      gsap.set(menu, {
        autoAlpha: 1,
        pointerEvents: "auto",
      });

      if (reducedMotion || isCompactLayout) {
        const visibleTargets = toTargetList(panel, guide, itemsEls);
        if (visibleTargets.length > 0) {
          gsap.set(visibleTargets, {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0,
          });
        }

        orbitTimelineRef.current?.pause();
        return;
      }

      const hasOrbitTimeline = Boolean(orbitTimelineRef.current);

      if (!hasOrbitTimeline) {
        if (orbitLayer) {
          gsap.set(orbitLayer, { rotation: 0, transformOrigin: "50% 50%" });
        }

        if (innerEls?.length) {
          gsap.set(innerEls, {
            rotation: 0,
            transformOrigin: "50% 50%",
          });
        }

        const orbitTimeline = gsap.timeline({
          paused: true,
          repeat: -1,
          defaults: { ease: "none" },
        });

        if (orbitLayer) {
          orbitTimeline.to(
            orbitLayer,
            {
              rotation: "+=360",
              duration: 13.2,
              ease: "none",
            },
            0,
          );
        }

        if (innerEls?.length) {
          orbitTimeline.to(
            innerEls,
            {
              rotation: "-=360",
              duration: 13.2,
              ease: "none",
            },
            0,
          );
        }

        orbitTimelineRef.current = orbitTimeline;
      }

      const introTargets = toTargetList(guide, itemsEls);
      if (introTargets.length > 0) {
        gsap.set(introTargets, {
          autoAlpha: 0,
          scale: 0.62,
        });
      }

      const introTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          orbitTimelineRef.current?.resume();
        },
      });

      introTimeline
        .fromTo(
          panel,
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.2 },
        )
        .fromTo(
          guide,
          { autoAlpha: 0, scale: 0.9 },
          { autoAlpha: 1, scale: 1, duration: 0.18 },
          "<",
        )
        .fromTo(
          itemsEls,
          { autoAlpha: 0, scale: 0.58 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.28,
            stagger: 0.04,
          },
          "<0.02",
        );

      introTimelineRef.current = introTimeline;
    }, wrapperRef);

    return () => {
      introTimelineRef.current?.kill();
      introTimelineRef.current = null;
      orbitTimelineRef.current?.kill();
      orbitTimelineRef.current = null;
      context.revert();
    };
  }, [effectiveRadius, isCompactLayout, isOpen, reducedMotion]);

  useEffect(() => {
    if (!isOpen || reducedMotion || isCompactLayout) {
      return undefined;
    }

    const handleVisibilityChange = () => {
      const orbitTimeline = orbitTimelineRef.current;
      if (!orbitTimeline) {
        return;
      }

      if (document.hidden) {
        orbitTimeline.pause();
        return;
      }

      orbitTimeline.resume();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isCompactLayout, isOpen, reducedMotion]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (wrapperRef.current?.contains(event.target)) {
        return;
      }

      setActiveMenu?.(null);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setActiveMenu?.(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setActiveMenu]);

  const handleTriggerClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    clearCloseTimer();
    isClosingRef.current = false;

    /*
     * Desktop:
     * Theme button click se theme cycle hoga.
     * Hover se circular options khulenge.
     *
     * Mobile:
     * Hover available nahi hai, isliye click options toggle karega.
     */
    if (triggerActionMode === "action" && !isCompactLayout) {
      onTriggerClick?.(event);
      return;
    }

    if (isOpen) {
      setActiveMenu?.(null);
      return;
    }

    openMenu();
  };

  const handleWrapperPointerEnter = (event) => {
    /*
     * Hover-open behavior sirf mouse/desktop par.
     * Touch par pointerenter ke through menu open nahi hoga.
     */
    if (!canHover || event.pointerType === "touch") {
      return;
    }

    openMenu();
  };

  const handleWrapperPointerLeave = (event) => {
    /*
     * Mobile/touch par pointerleave menu close nahi karega.
     */
    if (!canHover || event.pointerType === "touch") {
      return;
    }

    const nextTarget = event.relatedTarget;

    if (nextTarget && wrapperRef.current?.contains(nextTarget)) {
      return;
    }

    closeMenu(180);
  };

  const handleWrapperFocus = () => {
    /*
     * Desktop keyboard navigation par menu open hoga.
     * Mobile tap ko focus event control nahi karega.
     */
    if (!canHover) {
      return;
    }

    openMenu();
  };

  const handleWrapperBlur = (event) => {
    /*
     * Mobile par temporary blur ke kaaran menu close nahi hoga.
     * Outside tap wala useEffect menu close karega.
     */
    if (!canHover) {
      return;
    }

    const nextTarget = event.relatedTarget;

    if (nextTarget && wrapperRef.current?.contains(nextTarget)) {
      return;
    }

    closeMenu(120);
  };

  const handleItemSelect = (item, event) => {
    item.onClick?.(event);
    setActiveMenu?.(null);
  };

  const renderItem = (item) => {
    const Icon = item.icon;
    const interactiveClassName = [
      "nav-radial-item",
      itemClassName,
      item.danger ? "nav-radial-item--danger" : "",
      item.active ? "nav-radial-item--active" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const sharedProps = {
      key: item.key || item.label,
      className: interactiveClassName,
      "data-radial-item": true,
      "aria-label": item.ariaLabel || item.label,
      title: item.title || item.label,
      role: "menuitem",
      "data-cursor": item.cursor || "open",
      onClick: (event) => handleItemSelect(item, event),
      onPointerEnter: pauseOrbit,
      onPointerLeave: (event) => {
        if (wrapperRef.current?.contains(event.relatedTarget)) {
          return;
        }

        resumeOrbit();
      },
      onFocus: pauseOrbit,
      onBlur: (event) => {
        if (wrapperRef.current?.contains(event.relatedTarget)) {
          return;
        }

        resumeOrbit();
      },
    };

    const content = (
      <span className="nav-radial-item-inner" data-radial-item-inner>
        <span className="nav-radial-item-icon" aria-hidden="true">
          <Icon size={16} />
        </span>
        <span className="sr-only">{item.label}</span>
      </span>
    );

    return (
      <span
        key={`pos-${item.key || item.label}`}
        className="nav-radial-item-position"
        style={{
          "--orbit-x": `${item.orbitX}px`,
          "--orbit-y": `${item.orbitY}px`,
        }}
      >
        {item.to ? (
          <Link {...sharedProps} to={item.to}>
            {content}
          </Link>
        ) : item.href ? (
          <a
            {...sharedProps}
            href={item.href}
            target={item.target || (item.external ? "_blank" : undefined)}
            rel={
              item.rel || (item.external ? "noopener noreferrer" : undefined)
            }
          >
            {content}
          </a>
        ) : (
          <button {...sharedProps} type="button">
            {content}
          </button>
        )}
      </span>
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={`nav-radial-action ${
        isOpen ? "is-open" : ""
      } ${isCompactLayout ? "is-compact" : ""} ${menuClassName}`.trim()}
      data-action-item
      onPointerEnter={handleWrapperPointerEnter}
      onPointerLeave={handleWrapperPointerLeave}
      onFocusCapture={handleWrapperFocus}
      onBlurCapture={handleWrapperBlur}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          clearCloseTimer();
          setActiveMenu?.(null);
        }
      }}
    >
      <button
        type="button"
        className={`nav-action-button ${buttonClassName}`.trim()}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        title={triggerLabel}
        onClick={handleTriggerClick}
        data-cursor="open"
      >
        <span className="nav-action-button-inner">{triggerNode}</span>
      </button>

      <div
        id={menuId}
        ref={menuRef}
        className={`nav-radial-menu ${isOpen ? "is-open" : ""} ${
          isCompactLayout ? "is-compact" : ""
        }`.trim()}
        role="menu"
        aria-label={label}
      >
        <div
          ref={panelRef}
          className="nav-radial-menu-panel"
          style={{
            "--radial-menu-size": `${menuSize}px`,
            "--radial-radius": `${effectiveRadius}px`,
          }}
        >
          <span className="nav-radial-guide" aria-hidden="true" />

          {canHover && !isCompactLayout ? (
            <div ref={orbitLayerRef} className="nav-radial-orbit-layer">
              {orbitItems.map(renderItem)}
            </div>
          ) : (
            <div className="nav-radial-touch-panel">
              {orbitItems.map(renderItem)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadialActionMenu;
