import {
  seedEmpoweringCards,
} from "./empoweringCards.service.js";

export const runEmpoweringCardsSeed = async () => {
  try {
    console.log("[empoweringCards] Seeding homepage cards...");

    const result = await seedEmpoweringCards([
      {
        title: "Smart Farming",
        description: "Modern agricultural solutions",
        mediaType: "image",
        mediaUrl: "/optimized/farmer1-1536.jpg",
        mediaPublicId: "",
        mediaResourceType: "image",
        iconKey: "tractor",
        buttonText: "Learn More",
        buttonLink: "#",
        openInNewTab: false,
        displayOrder: 0,
        isActive: true,
      },
      {
        title: "Smart Farming",
        description: "Modern agricultural solutions",
        mediaType: "image",
        mediaUrl: "/optimized/farmer2-1536.jpg",
        mediaPublicId: "",
        mediaResourceType: "image",
        iconKey: "tractor",
        buttonText: "Learn More",
        buttonLink: "#",
        openInNewTab: false,
        displayOrder: 1,
        isActive: true,
      },
      {
        title: "Smart Farming",
        description: "Modern agricultural solutions",
        mediaType: "image",
        mediaUrl: "/optimized/farmer3-1536.jpg",
        mediaPublicId: "",
        mediaResourceType: "image",
        iconKey: "tractor",
        buttonText: "Learn More",
        buttonLink: "#",
        openInNewTab: false,
        displayOrder: 2,
        isActive: true,
      },
    ]);

    console.log("[empoweringCards] Seed result:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[empoweringCards] seed failed:", error.message);
    throw error;
  }
};
