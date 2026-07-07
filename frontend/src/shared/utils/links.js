export const isExternalLink = (value = "") => /^(https?:)?\/\//i.test(String(value).trim());

export const normalizeAppLink = (value, fallback = "/") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return fallback;
  return trimmed;
};

export const getProgramRouteIdentifier = (program = {}) => {
  const rawIdentifier = String(program.slug || program.id || "").trim();
  return rawIdentifier ? encodeURIComponent(rawIdentifier) : "";
};

export const getProgramDetailsPath = (program = {}) => {
  const identifier = getProgramRouteIdentifier(program);
  return identifier ? `/programs/${identifier}` : "/programs";
};
