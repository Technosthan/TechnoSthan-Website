const {
  getWorkspaceSettings,
  updateWorkspaceSettings,
  DEFAULT_SETTINGS,
  normalizeFeatureEntry,
} = require("../services/workspaceSettingsService");

(async () => {
  try {
    console.log("Starting workspace settings migration...");
    const ws = await getWorkspaceSettings({ bypassCache: true });
    const current = (ws && ws.settings) || {};

    const booleanKeys = Object.keys(DEFAULT_SETTINGS).filter(
      (k) => typeof DEFAULT_SETTINGS[k] === "boolean",
    );

    const updates = {};

    for (const key of booleanKeys) {
      const val = current.hasOwnProperty(key)
        ? current[key]
        : DEFAULT_SETTINGS[key];

      // If already an object with explicit 'enabled' property, assume migrated
      if (
        val &&
        typeof val === "object" &&
        Object.prototype.hasOwnProperty.call(val, "enabled")
      ) {
        continue;
      }

      // Only convert if the stored value is a boolean or missing
      if (typeof val === "boolean" || val === undefined) {
        updates[key] = normalizeFeatureEntry(
          key,
          val === undefined ? DEFAULT_SETTINGS[key] : val,
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      console.log("No boolean feature keys to migrate. Exiting.");
      process.exit(0);
    }

    console.log("Prepared updates for keys:", Object.keys(updates));

    const result = await updateWorkspaceSettings(updates, {
      id: "migration-script",
      name: "migration-script",
      role: "system",
    });

    console.log("Migration complete. Updated workspace settings saved.");
    console.log("Updated keys:", Object.keys(updates));
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(2);
  }
})();
