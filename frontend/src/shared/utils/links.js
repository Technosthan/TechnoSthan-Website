export const isExternalLink = (value = "") => /^(https?:)?\/\//i.test(String(value).trim());

export const normalizeAppLink = (value, fallback = "/") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return fallback;
  return trimmed;
};

export const getProgramRouteIdentifier = (program = {}) => {
  const specialisationSlug = String(program?.specialisation?.slug || program.specialisationSlug || "").trim();
  const programSlug = String(program.slug || program.id || "").trim();
  if (specialisationSlug && programSlug) {
    return `${encodeURIComponent(specialisationSlug)}/${encodeURIComponent(programSlug)}`;
  }
  return "";
};

export const getProgramDetailsPath = (program = {}) => {
  const identifier = getProgramRouteIdentifier(program);
  return identifier ? `/programs/${identifier}` : "/programs";
};

export const getSpecialisationProgramsPath = (specialisationSlug = "") => {
  const slug = String(specialisationSlug || "").trim();
  return slug ? `/programs/${encodeURIComponent(slug)}` : "/programs";
};
