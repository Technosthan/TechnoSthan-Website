export const formatLabel = (value) =>
  value.replace(/-/g, " ").replace(/(^\w|\s+\w)/g, (m) => m.toUpperCase());
