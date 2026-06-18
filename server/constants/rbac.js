const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  HR: "HR",
  USER: "USER",
});

const ROLE_LIST = Object.freeze(Object.values(ROLES));

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: [
    "dashboard:read",
    "users:read",
    "users:update",
    "users:delete",
    "roles:update",
    "assignments:create",
    "assignments:read",
    "assignments:update",
    "assignments:delete",
    "assignments:review",
    "submissions:read",
    "submissions:review",
    "analytics:read",
    "notifications:read",
  ],
  [ROLES.HR]: [
    "dashboard:read",
    "assignments:create",
    "assignments:read",
    "assignments:update",
    "assignments:review",
    "submissions:read",
    "submissions:review",
    "users:read",
    "notifications:read",
  ],
  [ROLES.USER]: [
    "dashboard:read",
    "assignments:read",
    "submissions:create",
    "submissions:read",
    "notifications:read",
  ],
});

const normalizeRole = (role) => {
  const normalized = String(role || "")
    .trim()
    .toUpperCase();
  return ROLE_LIST.includes(normalized) ? normalized : ROLES.USER;
};

const getRolePermissions = (role) => ROLE_PERMISSIONS[normalizeRole(role)] || [];

const hasRole = (role, acceptedRoles = []) =>
  acceptedRoles.map(normalizeRole).includes(normalizeRole(role));

const getRoleVariants = (role) => {
  const normalized = normalizeRole(role);
  const lower = normalized.toLowerCase();
  const title = `${normalized.charAt(0)}${lower.slice(1)}`;
  return [...new Set([normalized, lower, title])];
};

module.exports = {
  ROLES,
  ROLE_LIST,
  ROLE_PERMISSIONS,
  normalizeRole,
  getRolePermissions,
  hasRole,
  getRoleVariants,
};
