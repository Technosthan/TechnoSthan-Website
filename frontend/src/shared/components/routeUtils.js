export const normalizeRoutePattern = (pattern) => {
  if (!pattern || typeof pattern !== "string") {
    return null;
  }

  const trimmed = pattern.trim();
  if (trimmed.endsWith("*")) {
    return new RegExp(`^${trimmed.replace(/\*+$/, ".*")}$`);
  }

  if (trimmed.includes(":")) {
    const regex = trimmed
      .split("/")
      .map((segment) =>
        segment.startsWith(":")
          ? "[^/]+"
          : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      )
      .join("/");
    return new RegExp(`^${regex}$`);
  }

  return trimmed;
};
