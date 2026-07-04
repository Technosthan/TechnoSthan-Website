import {
  BriefcaseBusiness,
  HandCoins,
  Lightbulb,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const startupData = [
  {
    title: "Startup Incubation",
    description:
      "Guide founders with a structured launch plan, mentorship, and practical execution support.",
    stage: "Stage 1",
    supports: ["Idea Validation", "Planning", "Support"],
    icon: Lightbulb,
  },
  {
    title: "Business Mentorship",
    description:
      "Receive focused advice on business model design, growth strategy, and market positioning.",
    stage: "Stage 2",
    supports: ["Strategy", "Roadmaps", "Advisory"],
    icon: HandCoins,
  },
  {
    title: "Product Development",
    description:
      "Turn your concept into a product roadmap with technical clarity and iterative delivery.",
    stage: "Stage 3",
    supports: ["Roadmap", "Design", "Build"],
    icon: Rocket,
  },
  {
    title: "MVP Development",
    description:
      "Launch a lean version of your product quickly to test demand and gather real feedback.",
    stage: "Stage 4",
    supports: ["Prototype", "Testing", "Feedback"],
    icon: Sparkles,
  },
  {
    title: "Investor Readiness",
    description:
      "Prepare compelling business narratives, pitch assets, and growth storytelling for funding.",
    stage: "Stage 5",
    supports: ["Pitch Deck", "Story", "Positioning"],
    icon: TrendingUp,
  },
  {
    title: "Industry Partnerships",
    description:
      "Connect with mentors, potential clients, and ecosystem stakeholders that accelerate growth.",
    stage: "Stage 6",
    supports: ["Networking", "Collaboration", "Growth"],
    icon: BriefcaseBusiness,
  },
];
