import {
  BrainCircuit,
  Code2,
  Cpu,
  Database,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export const programsData = [
  {
    title: "Full Stack Development",
    description:
      "Build modern web apps from scratch with backend, deployment, and portfolio-ready components.",
    duration: "6 Months",
    level: "Beginner to Advanced",
    badge: "Placement Ready",
    highlights: ["Real Projects", "Resume Support", "Live Mentors"],
    icon: Code2,
  },
  {
    title: "AI & Machine Learning",
    description:
      "Work with models, datasets, and intelligent systems using practical industry use cases.",
    duration: "6 Months",
    level: "Intermediate",
    badge: "Industry Focus",
    highlights: ["Hands-on Labs", "Case Studies", "Model Deployment"],
    icon: BrainCircuit,
  },
  {
    title: "Data Analytics",
    description:
      "Turn raw data into insight with dashboards, SQL, Python, and business storytelling.",
    duration: "4 Months",
    level: "Beginner",
    badge: "Career Track",
    highlights: ["Dashboards", "SQL", "Excel + Python"],
    icon: Database,
  },
  {
    title: "Embedded Systems & IoT",
    description:
      "Create connected hardware solutions through circuit design, sensors, and embedded coding.",
    duration: "5 Months",
    level: "Intermediate",
    badge: "Hands-on",
    highlights: ["Sensors", "Microcontrollers", "Device Testing"],
    icon: Cpu,
  },
  {
    title: "Robotics & Automation",
    description:
      "Design automation workflows and intelligent machines with robotics kits and control logic.",
    duration: "5 Months",
    level: "Intermediate",
    badge: "Innovation",
    highlights: ["Robotics Kits", "Automation", "Prototype Builds"],
    icon: Workflow,
  },
  {
    title: "Cyber Security",
    description:
      "Learn secure coding, threat analysis, and practical defense strategies for modern systems.",
    duration: "4 Months",
    level: "Beginner",
    badge: "Security Track",
    highlights: ["Ethical Hacking", "Security Lab", "Threat Simulation"],
    icon: ShieldCheck,
  },
];
