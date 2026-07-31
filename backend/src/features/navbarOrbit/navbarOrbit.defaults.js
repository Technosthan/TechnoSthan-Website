export const NAVBAR_ORBIT_GROUPS = {
  SOCIAL: "social",
  THEME: "theme",
  PROFILE: "profile",
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
    systemActionKey: "dark",
    label: "Dark mode",
    iconKey: "FiMoon",
    displayOrder: 1,
    tooltip: "Switch to dark mode",
  },
  {
    systemActionKey: "light",
    label: "Light mode",
    iconKey: "FiSun",
    displayOrder: 2,
    tooltip: "Switch to light mode",
  },
  {
    systemActionKey: "system",
    label: "System mode",
    iconKey: "FiMonitor",
    displayOrder: 3,
    tooltip: "Follow system preference",
  },
];

export const NAVBAR_ORBIT_PROFILE_ACTIONS = [
  {
    systemActionKey: "login",
    label: "Login",
    iconKey: "FiLogIn",
    displayOrder: 1,
    visibility: NAVBAR_ORBIT_VISIBILITY.GUEST,
    tooltip: "Open the login page",
  },
  {
    systemActionKey: "register",
    label: "Register",
    iconKey: "FiUserPlus",
    displayOrder: 2,
    visibility: NAVBAR_ORBIT_VISIBILITY.GUEST,
    tooltip: "Create a new account",
  },
  {
    systemActionKey: "dashboard",
    label: "Dashboard",
    iconKey: "FiMonitor",
    displayOrder: 3,
    visibility: NAVBAR_ORBIT_VISIBILITY.AUTHENTICATED,
    tooltip: "Open the dashboard",
  },
  {
    systemActionKey: "admin-dashboard",
    label: "Admin Dashboard",
    iconKey: "FiMonitor",
    displayOrder: 4,
    visibility: NAVBAR_ORBIT_VISIBILITY.ADMIN,
    tooltip: "Open the admin dashboard",
  },
  {
    systemActionKey: "profile",
    label: "My Profile",
    iconKey: "FiUser",
    displayOrder: 5,
    visibility: NAVBAR_ORBIT_VISIBILITY.AUTHENTICATED,
    tooltip: "Open your profile",
  },
  {
    systemActionKey: "logout",
    label: "Logout",
    iconKey: "FiLogOut",
    displayOrder: 6,
    visibility: NAVBAR_ORBIT_VISIBILITY.AUTHENTICATED,
    tooltip: "Sign out of your account",
  },
];

export const NAVBAR_ORBIT_SOCIAL_DEFAULTS = [
  {
    systemActionKey: "linkedin",
    label: "LinkedIn",
    iconKey: "FiLinkedin",
    externalUrl: "https://www.linkedin.com/company/technosthan/",
    displayOrder: 1,
    tooltip: "Open TechnoSthan on LinkedIn",
  },
  {
    systemActionKey: "twitter",
    label: "X / Twitter",
    iconKey: "FiTwitter",
    externalUrl: "https://twitter.com/technosthan",
    displayOrder: 2,
    tooltip: "Open TechnoSthan on X / Twitter",
  },
  {
    systemActionKey: "facebook",
    label: "Facebook",
    iconKey: "FiFacebook",
    externalUrl: "https://www.facebook.com/technosthan",
    displayOrder: 3,
    tooltip: "Open TechnoSthan on Facebook",
  },
  {
    systemActionKey: "youtube",
    label: "YouTube",
    iconKey: "FiYoutube",
    externalUrl: "https://www.youtube.com/@technosthan",
    displayOrder: 4,
    tooltip: "Open TechnoSthan on YouTube",
  },
  {
    systemActionKey: "instagram",
    label: "Instagram",
    iconKey: "FiInstagram",
    externalUrl: "https://www.instagram.com/technosthan",
    displayOrder: 5,
    tooltip: "Open TechnoSthan on Instagram",
  },
  {
    systemActionKey: "github",
    label: "GitHub",
    iconKey: "FiGithub",
    externalUrl: "https://github.com/technosthan",
    displayOrder: 6,
    tooltip: "Open TechnoSthan on GitHub",
  },
];

export const NAVBAR_ORBIT_DEFAULT_ITEMS = [
  ...NAVBAR_ORBIT_SOCIAL_DEFAULTS.map((item) => ({
    groupKey: NAVBAR_ORBIT_GROUPS.SOCIAL,
    actionType: NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL,
    openInNewTab: true,
    visibility: NAVBAR_ORBIT_VISIBILITY.PUBLIC,
    isActive: true,
    isSystem: true,
    internalPath: null,
    ...item,
  })),
  ...NAVBAR_ORBIT_THEME_MODES.map((item) => ({
    groupKey: NAVBAR_ORBIT_GROUPS.THEME,
    actionType: NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE,
    openInNewTab: false,
    visibility: NAVBAR_ORBIT_VISIBILITY.PUBLIC,
    isActive: true,
    isSystem: true,
    externalUrl: null,
    internalPath: null,
    ...item,
  })),
  ...NAVBAR_ORBIT_PROFILE_ACTIONS.map((item) => ({
    groupKey: NAVBAR_ORBIT_GROUPS.PROFILE,
    actionType: NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION,
    openInNewTab: false,
    visibility: item.visibility,
    isActive: true,
    isSystem: true,
    externalUrl: null,
    internalPath: null,
    ...item,
  })),
];

export const ALLOWED_NAVBAR_ORBIT_ICON_KEYS = [
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

export const ALLOWED_NAVBAR_ORBIT_GROUP_KEYS = Object.values(
  NAVBAR_ORBIT_GROUPS
);

export const ALLOWED_NAVBAR_ORBIT_ACTION_TYPES = Object.values(
  NAVBAR_ORBIT_ACTION_TYPES
);

export const ALLOWED_NAVBAR_ORBIT_VISIBILITY = Object.values(
  NAVBAR_ORBIT_VISIBILITY
);
