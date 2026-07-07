export const confirmAdminDelete = (label = "this item") => {
  if (typeof window === "undefined") {
    return true;
  }

  return window.confirm(
    `Are you sure you want to delete ${label}? This action cannot be undone.`,
  );
};
