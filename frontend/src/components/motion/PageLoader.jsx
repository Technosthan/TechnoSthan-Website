import { useCallback, useEffect, useRef } from "react";

import { gsap, setupGsap } from "../../animations/gsapSetup";
import { refreshScrollTriggers } from "../../animations/scrollAnimations";
import useReducedMotion from "../../hooks/useReducedMotion";
import { useAppMotion } from "../../providers/AppMotionProvider";
import ParticleScene from "./ParticleScene";
import herobanner from "../../assets/images/hero/hero-optimized.jpg";

const MAX_LOADER_TIME = 2500;
const WAIT_FOR_ASSETS_TIME = 900;
const PROGRESS_DURATION = 1500;
const EXIT_DELAY = 180;

const sleep = (duration) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

const preloadImage = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const image = new Image();

    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;

    if (image.complete) {
      resolve();
    }
  });

const waitForFonts = () =>
  Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    sleep(1000),
  ]);

const PageLoader = () => {
  const loaderRef = useRef(null);
  const contentRef = useRef(null);
  const markRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const kickerRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressTextRef = useRef(null);
  const progressProxyRef = useRef({ value: 0 });
  const timelineRef = useRef(null);
  const contextRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const startedRef = useRef(false);
  const mountedRef = useRef(false);
  const runIdRef = useRef(0);
  const hasCompletedRef = useRef(false);

  const reducedMotion = useReducedMotion();
  const { isLoading, setLoading, setAppReady } = useAppMotion();

  const updateProgressText = useCallback((nextValue) => {
    if (progressTextRef.current) {
      progressTextRef.current.textContent = String(nextValue).padStart(2, "0");
    }
  }, []);

  const completeLoader = useCallback(() => {
    if (hasCompletedRef.current || !mountedRef.current) {
      return;
    }

    hasCompletedRef.current = true;

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    document.body.classList.remove("is-loading");
    document.body.style.overflow = "";
    setLoading(false);
    setAppReady(true);

    requestAnimationFrame(() => {
      refreshScrollTriggers();
    });
  }, [setAppReady, setLoading]);

  useEffect(() => {
    mountedRef.current = true;

    if (reducedMotion || !isLoading) {
      completeLoader();
      return () => {
        mountedRef.current = false;
      };
    }

    if (startedRef.current) {
      return () => {
        mountedRef.current = false;
      };
    }

    startedRef.current = true;
    const runId = ++runIdRef.current;
    setupGsap();

    document.body.classList.add("is-loading");
    document.body.style.overflow = "hidden";

    gsap.set(loaderRef.current, { autoAlpha: 1, yPercent: 0 });
    gsap.set(progressBarRef.current, {
      scaleX: 0,
      transformOrigin: "left center",
    });
    gsap.set(progressTextRef.current, { textContent: "00" });
    updateProgressText(0);

    const assetPromises = [
      waitForFonts(),
      preloadImage(herobanner),
      preloadImage("/itfavicon-128.png"),
    ];

    const startSequence = async () => {
      await Promise.race([
        Promise.allSettled(assetPromises),
        sleep(WAIT_FOR_ASSETS_TIME),
      ]);

      if (
        !mountedRef.current ||
        hasCompletedRef.current ||
        runId !== runIdRef.current
      ) {
        return;
      }

      const progressProxy = progressProxyRef.current;
      progressProxy.value = 0;

      const context = gsap.context(() => {
        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: completeLoader,
        });

        timeline
          .fromTo(
            markRef.current,
            { autoAlpha: 0, scale: 0.86, y: 10 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.35 }
          )
          .fromTo(
            kickerRef.current,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.32 },
            "-=0.12"
          )
          .fromTo(
            headingRef.current,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.38 },
            "-=0.1"
          )
          .fromTo(
            subtitleRef.current,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.3 },
            "-=0.18"
          )
          .fromTo(
            contentRef.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.15 },
            "-=0.25"
          )
          .to(
            progressProxy,
            {
              value: 100,
              duration: PROGRESS_DURATION / 1000,
              ease: "power2.inOut",
              onUpdate: () => {
                const nextValue = Math.round(progressProxy.value);
                updateProgressText(nextValue);
              },
            },
            "<"
          )
          .fromTo(
            progressBarRef.current,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1,
              duration: PROGRESS_DURATION / 1000,
              ease: "power2.inOut",
            },
            "<"
          )
          .to(
            contentRef.current,
            {
              y: -18,
              autoAlpha: 0,
              duration: 0.28,
            },
            `+=${EXIT_DELAY / 1000}`
          )
          .to(
            loaderRef.current,
            {
              yPercent: -100,
              duration: 0.42,
              ease: "power3.inOut",
            },
            "<"
          );

        timelineRef.current = timeline;
        timeline.play(0);
      }, loaderRef);

      contextRef.current = context;
    };

    startSequence();

    fallbackTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current || hasCompletedRef.current) {
        return;
      }

      completeLoader();
    }, MAX_LOADER_TIME);

    return () => {
      mountedRef.current = false;

      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }

      if (contextRef.current) {
        contextRef.current.revert();
        contextRef.current = null;
      }

      document.body.classList.remove("is-loading");
      document.body.style.overflow = "";
    };
  }, [completeLoader, isLoading, reducedMotion, updateProgressText]);

  if (!isLoading || reducedMotion) {
    return null;
  }

  return (
    <div
      ref={loaderRef}
      className="page-loader"
      aria-label="Loading Technosthan"
      role="status"
      aria-busy="true"
    >
      <ParticleScene variant="loader" className="page-loader-particles" />
      <div
        className="page-loader-panel page-loader-panel-left"
        data-loader-line
      />
      <div
        className="page-loader-panel page-loader-panel-right"
        data-loader-line
      />

      <div className="page-loader-content" ref={contentRef}>
        <div className="page-loader-mark" ref={markRef} data-loader-mark>
          <span>T</span>
        </div>

        <p className="page-loader-kicker" ref={kickerRef} data-loader-line>
          TECHNOSTHAN
        </p>
        <h1 ref={headingRef} data-loader-line>
          Building Digital Excellence
        </h1>
        <p className="page-loader-subtitle" ref={subtitleRef} data-loader-line>
          Enterprise IT services, software engineering, and digital transformation.
        </p>

        <div className="page-loader-progress-row" data-loader-line>
          <span ref={progressTextRef}>00</span>
          <div className="page-loader-progress-track">
            <div
              className="page-loader-progress-fill"
              ref={progressBarRef}
              data-loader-progress
            />
          </div>
          <span aria-hidden="true">100</span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
