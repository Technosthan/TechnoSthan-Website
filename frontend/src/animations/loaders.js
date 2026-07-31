const isBrowser = typeof window !== "undefined";

export const preloadImage = (src) =>
  new Promise((resolve) => {
    if (!isBrowser || !src || typeof Image === "undefined") {
      resolve();
      return;
    }

    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });

export const preloadImages = async (sources = []) => {
  await Promise.allSettled(
    sources.filter(Boolean).map((source) => preloadImage(source))
  );
};

