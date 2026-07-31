import {
  FiFacebook,
  FiGithub,
  FiGlobe,
  FiInstagram,
  FiLink,
  FiLinkedin,
  FiLogIn,
  FiLogOut,
  FiMail,
  FiMonitor,
  FiMoon,
  FiShare2,
  FiSun,
  FiTwitter,
  FiUser,
  FiUserPlus,
  FiYoutube,
} from "react-icons/fi";

export const NAVBAR_ORBIT_GROUPS = {
  SOCIAL: "social",
  THEME: "theme",
  PROFILE: "profile",
};

export const NAVBAR_ORBIT_GROUP_LABELS = {
  [NAVBAR_ORBIT_GROUPS.SOCIAL]: "Social",
  [NAVBAR_ORBIT_GROUPS.THEME]: "Theme",
  [NAVBAR_ORBIT_GROUPS.PROFILE]: "Profile",
};

export const NAVBAR_ORBIT_ACTION_TYPES = {
  EXTERNAL_URL: "external_url",
  INTERNAL_ROUTE: "internal_route",
  THEME_MODE: "theme_mode",
  AUTH_ACTION: "auth_action",
};

export const NAVBAR_ORBIT_VISIBILITY = {
  PUBLIC: "public",
  GUEST: "guest",
  AUTHENTICATED: "authenticated",
  USER: "user",
  ADMIN: "admin",
};

export const NAVBAR_ORBIT_THEME_MODES = [
  {
    key: "dark",
    label: "Dark mode",
    iconKey: "FiMoon",
    tooltip: "Switch to dark mode",
  },
  {
    key: "light",
    label: "Light mode",
    iconKey: "FiSun",
    tooltip: "Switch to light mode",
  },
  {
    key: "system",
    label: "System mode",
    iconKey: "FiMonitor",
    tooltip: "Follow system preference",
  },
];

export const NAVBAR_ORBIT_PROFILE_ACTIONS = [
  {
    key: "login",
    label: "Login",
    iconKey: "FiLogIn",
    visibility: NAVBAR_ORBIT_VISIBILITY.GUEST,
    tooltip: "Open the login page",
  },
  {
    key: "register",
    label: "Register",
    iconKey: "FiUserPlus",
    visibility: NAVBAR_ORBIT_VISIBILITY.GUEST,
    tooltip: "Create a new account",
  },
  {
    key: "dashboard",
    label: "Dashboard",
    iconKey: "FiMonitor",
    visibility: NAVBAR_ORBIT_VISIBILITY.AUTHENTICATED,
    tooltip: "Open the dashboard",
  },
  {
    key: "admin-dashboard",
    label: "Admin Dashboard",
    iconKey: "FiMonitor",
    visibility: NAVBAR_ORBIT_VISIBILITY.ADMIN,
    tooltip: "Open the admin dashboard",
  },
  {
    key: "profile",
    label: "My Profile",
    iconKey: "FiUser",
    visibility: NAVBAR_ORBIT_VISIBILITY.AUTHENTICATED,
    tooltip: "Open your profile",
  },
  {
    key: "logout",
    label: "Logout",
    iconKey: "FiLogOut",
    visibility: NAVBAR_ORBIT_VISIBILITY.AUTHENTICATED,
    tooltip: "Sign out of your account",
  },
];

export const NAVBAR_ORBIT_SOCIAL_DEFAULTS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    iconKey: "FiLinkedin",
    href: "https://www.linkedin.com/company/technosthan/",
    tooltip: "Open TechnoSthan on LinkedIn",
  },
  {
    key: "twitter",
    label: "X / Twitter",
    iconKey: "FiTwitter",
    href: "https://twitter.com/technosthan",
    tooltip: "Open TechnoSthan on X / Twitter",
  },
  {
    key: "facebook",
    label: "Facebook",
    iconKey: "FiFacebook",
    href: "https://www.facebook.com/technosthan",
    tooltip: "Open TechnoSthan on Facebook",
  },
  {
    key: "youtube",
    label: "YouTube",
    iconKey: "FiYoutube",
    href: "https://www.youtube.com/@technosthan",
    tooltip: "Open TechnoSthan on YouTube",
  },
  {
    key: "instagram",
    label: "Instagram",
    iconKey: "FiInstagram",
    href: "https://www.instagram.com/technosthan",
    tooltip: "Open TechnoSthan on Instagram",
  },
  {
    key: "github",
    label: "GitHub",
    iconKey: "FiGithub",
    href: "https://github.com/technosthan",
    tooltip: "Open TechnoSthan on GitHub",
  },
];

export const NAVBAR_ORBIT_THEME_DEFAULTS = NAVBAR_ORBIT_THEME_MODES.map(
  (item, index) => ({
    key: item.key,
    label: item.label,
    iconKey: item.iconKey,
    systemActionKey: item.key,
    actionType: NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE,
    visibility: NAVBAR_ORBIT_VISIBILITY.PUBLIC,
    displayOrder: index + 1,
    isActive: true,
    isSystem: true,
    tooltip: item.tooltip,
  })
);

export const NAVBAR_ORBIT_PROFILE_DEFAULTS = NAVBAR_ORBIT_PROFILE_ACTIONS.map(
  (item, index) => ({
    key: item.key,
    label: item.label,
    iconKey: item.iconKey,
    systemActionKey: item.key,
    actionType: NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION,
    visibility: item.visibility,
    displayOrder: index + 1,
    isActive: true,
    isSystem: true,
    tooltip: item.tooltip,
  })
);

export const NAVBAR_ORBIT_SOCIAL_SEEDS = NAVBAR_ORBIT_SOCIAL_DEFAULTS.map(
  (item, index) => ({
    key: item.key,
    label: item.label,
    iconKey: item.iconKey,
    systemActionKey: item.key,
    actionType: NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL,
    externalUrl: item.href,
    openInNewTab: true,
    visibility: NAVBAR_ORBIT_VISIBILITY.PUBLIC,
    displayOrder: index + 1,
    isActive: true,
    isSystem: true,
    tooltip: item.tooltip,
  })
);

export const NAVBAR_ORBIT_DEFAULT_ITEMS = [
  ...NAVBAR_ORBIT_SOCIAL_SEEDS,
  ...NAVBAR_ORBIT_THEME_DEFAULTS,
  ...NAVBAR_ORBIT_PROFILE_DEFAULTS,
];

export const NAVBAR_ORBIT_ICON_OPTIONS = [
  "FiBriefcase",
  "FiCode",
  "FiCloud",
  "FiCpu",
  "FiDatabase",
  "FiFacebook",
  "FiGithub",
  "FiGlobe",
  "FiHeart",
  "FiInstagram",
  "FiLink",
  "FiLinkedin",
  "FiLogIn",
  "FiLogOut",
  "FiMail",
  "FiMonitor",
  "FiMoon",
  "FiServer",
  "FiShare2",
  "FiShield",
  "FiSmartphone",
  "FiStar",
  "FiSun",
  "FiTwitter",
  "FiUser",
  "FiUserPlus",
  "FiYoutube",
  "FiZap",
];

export const NAVBAR_ORBIT_ICON_HELPERS = {
  FiFacebook,
  FiGithub,
  FiGlobe,
  FiInstagram,
  FiLink,
  FiLinkedin,
  FiLogIn,
  FiLogOut,
  FiMail,
  FiMonitor,
  FiMoon,
  FiShare2,
  FiSun,
  FiTwitter,
  FiUser,
  FiUserPlus,
  FiYoutube,
};
