import { runHomepageServicesSeed } from "./homepageServices.service.js";

export const seedHomepageServices = async () => {
  try {
    console.log("[homepageServices] Seeding homepage services...");
    const result = await runHomepageServicesSeed();
    console.log("[homepageServices] Seed result:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[homepageServices] seed failed:", error.message);
    throw error;
  }
};
