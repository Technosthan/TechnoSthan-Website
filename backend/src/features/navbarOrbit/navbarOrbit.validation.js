import {
  ALLOWED_NAVBAR_ORBIT_ACTION_TYPES,
  ALLOWED_NAVBAR_ORBIT_GROUP_KEYS,
  ALLOWED_NAVBAR_ORBIT_ICON_KEYS,
  ALLOWED_NAVBAR_ORBIT_VISIBILITY,
  NAVBAR_ORBIT_ACTION_TYPES,
  NAVBAR_ORBIT_GROUPS,
} from "./navbarOrbit.defaults.js";

const sanitize = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const hasUnsafeMarkup = (value) =>
  /<\s*\/?\s*[a-z][^>]*>/i.test(String(value || "")) ||
  /<\/?script/i.test(String(value || ""));

const isSafeHttpUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(String(value).trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const isSafeInternalPath = (value) => {
  const path = String(value || "").trim();
  return path.startsWith("/") && !/^\/\//.test(path);
};

const validateBaseFields = (res, body) => {
  const groupKey = normalizeKey(body.groupKey);
  const actionType = normalizeKey(body.actionType);
  const visibility = normalizeKey(body.visibility || "public");
  const label = sanitize(body.label || "");
  const iconKey = sanitize(body.iconKey || "");
  const systemActionKey = normalizeKey(body.systemActionKey || "");

  if (!ALLOWED_NAVBAR_ORBIT_GROUP_KEYS.includes(groupKey)) {
    res.status(400).json({
      success: false,
      message: "Invalid orbit group",
    });
    return null;
  }

  if (!ALLOWED_NAVBAR_ORBIT_ACTION_TYPES.includes(actionType)) {
    res.status(400).json({
      success: false,
      message: "Invalid orbit action type",
    });
    return null;
  }

  if (!ALLOWED_NAVBAR_ORBIT_VISIBILITY.includes(visibility)) {
    res.status(400).json({
      success: false,
      message: "Invalid visibility rule",
    });
    return null;
  }

  if (!label) {
    res.status(400).json({
      success: false,
      message: "Label is required",
    });
    return null;
  }

  if (hasUnsafeMarkup(label)) {
    res.status(400).json({
      success: false,
      message: "Label must not contain HTML",
    });
    return null;
  }

  if (iconKey && !ALLOWED_NAVBAR_ORBIT_ICON_KEYS.includes(iconKey)) {
    res.status(400).json({
      success: false,
      message: "Invalid icon key",
    });
    return null;
  }

  if (
    groupKey === NAVBAR_ORBIT_GROUPS.THEME &&
    actionType !== NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE
  ) {
    res.status(400).json({
      success: false,
      message: "Theme group items must use a theme mode action",
    });
    return null;
  }

  if (
    groupKey === NAVBAR_ORBIT_GROUPS.SOCIAL &&
    actionType !== NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL
  ) {
    res.status(400).json({
      success: false,
      message: "Social orbit items must use an external URL action",
    });
    return null;
  }

  if (
    groupKey === NAVBAR_ORBIT_GROUPS.PROFILE &&
    ![
      NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION,
      NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE,
      NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL,
    ].includes(actionType)
  ) {
    res.status(400).json({
      success: false,
      message:
        "Profile orbit items must use an auth action, internal route, or external URL",
    });
    return null;
  }

  if (actionType === NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL) {
    const externalUrl = sanitize(body.externalUrl || "");

    if (!isSafeHttpUrl(externalUrl)) {
      res.status(400).json({
        success: false,
        message: "A safe HTTP or HTTPS external URL is required",
      });
      return null;
    }
  }

  if (actionType === NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE) {
    const internalPath = sanitize(body.internalPath || "");

    if (!isSafeInternalPath(internalPath)) {
      res.status(400).json({
        success: false,
        message: "A safe internal route path is required",
      });
      return null;
    }
  }

  if (actionType === NAVBAR_ORBIT_ACTION_TYPES.THEME_MODE && !systemActionKey) {
    res.status(400).json({
      success: false,
      message: "Theme mode is required",
    });
    return null;
  }

  if (actionType === NAVBAR_ORBIT_ACTION_TYPES.AUTH_ACTION && !systemActionKey) {
    res.status(400).json({
      success: false,
      message: "Profile system action is required",
    });
    return null;
  }

  return {
    groupKey,
    actionType,
    visibility,
    label,
    iconKey: iconKey || null,
    systemActionKey: systemActionKey || null,
  };
};

export const validateOrbitItemPayload = (req, res, next) => {
  const result = validateBaseFields(res, req.body || {});
  if (!result) {
    return;
  }

  next();
};

export const validateOrbitItemStatus = (req, res, next) => {
  if (req.body?.isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  next();
};

export const validateOrbitReorderPayload = (req, res, next) => {
  const groupKey = normalizeKey(req.body?.groupKey);
  const orderedIds = Array.isArray(req.body?.orderedIds)
    ? req.body.orderedIds
    : [];

  if (!ALLOWED_NAVBAR_ORBIT_GROUP_KEYS.includes(groupKey)) {
    return res.status(400).json({
      success: false,
      message: "Invalid orbit group",
    });
  }

  if (orderedIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "orderedIds is required",
    });
  }

  next();
};

export const validateOrbitResetPayload = (req, res, next) => {
  const groupKey = normalizeKey(req.body?.groupKey);

  if (!ALLOWED_NAVBAR_ORBIT_GROUP_KEYS.includes(groupKey)) {
    return res.status(400).json({
      success: false,
      message: "Invalid orbit group",
    });
  }

  next();
};

export const normalizeOrbitPayload = (body, existing = {}) => {
  const groupKey = normalizeKey(body.groupKey || existing.groupKey);
  const actionType = normalizeKey(body.actionType || existing.actionType);
  const visibility = normalizeKey(
    body.visibility || existing.visibility || "public"
  );
  const systemActionKey = normalizeKey(
    body.systemActionKey || existing.systemActionKey || ""
  );
  const label = sanitize(body.label ?? existing.label);
  const iconKey = sanitize(body.iconKey ?? existing.iconKey);
  const tooltip = sanitize(body.tooltip ?? existing.tooltip);
  const externalUrl = sanitize(body.externalUrl ?? existing.externalUrl);
  const internalPath = sanitize(body.internalPath ?? existing.internalPath);
  const openInNewTab =
    body.openInNewTab === undefined
      ? Boolean(existing.openInNewTab ?? true)
      : ["true", "1", "yes", "on", true].includes(body.openInNewTab);
  const displayOrder =
    body.displayOrder === undefined
      ? Number.parseInt(existing.displayOrder ?? 0, 10)
      : Number.parseInt(body.displayOrder, 10);
  const isActive =
    body.isActive === undefined
      ? Boolean(existing.isActive ?? true)
      : ["true", "1", "yes", "on", true].includes(body.isActive);

  return {
    groupKey,
    actionType,
    visibility,
    systemActionKey: systemActionKey || null,
    label,
    iconKey: iconKey || null,
    tooltip: tooltip || null,
    externalUrl: externalUrl || null,
    internalPath: internalPath || null,
    openInNewTab,
    displayOrder: Number.isNaN(displayOrder) ? 0 : displayOrder,
    isActive,
    isSystem:
      body.isSystem === undefined
        ? Boolean(existing.isSystem ?? false)
        : ["true", "1", "yes", "on", true].includes(body.isSystem),
  };
};

