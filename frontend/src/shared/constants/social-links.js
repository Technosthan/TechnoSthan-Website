import {
  FiGithub,
  FiLinkedin,
  FiMail,
  FiTwitter,
} from "react-icons/fi";

export const PUBLIC_SOCIAL_LINKS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/technosthan/",
    title: "Open TechnoSthan on LinkedIn",
    icon: FiLinkedin,
    external: true,
  },
  {
    key: "twitter",
    label: "X / Twitter",
    href: "https://twitter.com/technosthan",
    title: "Open TechnoSthan on X / Twitter",
    icon: FiTwitter,
    external: true,
  },
];

export const FOOTER_SOCIAL_LINKS = [
  ...PUBLIC_SOCIAL_LINKS,
  {
    key: "github",
    label: "GitHub",
    href: "https://github.com/technosthan",
    title: "Open TechnoSthan on GitHub",
    icon: FiGithub,
    external: true,
  },
  {
    key: "email",
    label: "Email",
    href: "mailto:info@technosthan.com",
    title: "Email TechnoSthan",
    icon: FiMail,
    external: false,
  },
];
