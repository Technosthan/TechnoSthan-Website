import Settings from "../admin/settings.model.js";

export const migrateAISettings = async () => {
  try {
    console.log("Starting AI settings migration...");

    const settings = await Settings.findOne()
      .select("+aiSettings.apiKey")
      .lean();

    if (!settings || !settings.aiSettings) {
      console.log("No existing AI settings found, skipping migration");
      return;
    }

    const oldAISettings = settings.aiSettings;

    // Check if already migrated (has providers array)
    if (oldAISettings.providers && Array.isArray(oldAISettings.providers)) {
      console.log("AI settings already migrated");
      return;
    }

    // Create default provider from existing settings
    const defaultProvider = {
      providerId: "default-" + Date.now(),
      providerType: oldAISettings.provider || "gemini",
      customName:
        oldAISettings.provider === "custom" ? "Migrated Custom Provider" : "",
      apiKey: oldAISettings.apiKey || "",
      modelName: oldAISettings.model || "gemini-2.5-pro",
      apiUrl: oldAISettings.apiUrl || "",
      isActive: true,
      isPaused: false,
      priority: 1,
      createdAt: new Date(),
    };

    // Update settings with new structure
    const updateObj = {
      "aiSettings.mode": "single",
      "aiSettings.providers": [defaultProvider],
    };

    // Remove old fields
    const fieldsToUnset = [
      "aiSettings.provider",
      "aiSettings.apiKey",
      "aiSettings.model",
      "aiSettings.apiUrl",
    ];

    await Settings.findOneAndUpdate(
      {},
      {
        $set: updateObj,
        $unset: Object.fromEntries(fieldsToUnset.map((field) => [field, ""])),
      },
      { new: true, upsert: true },
    );

    console.log("AI settings migration completed successfully");
  } catch (error) {
    console.error("AI settings migration failed:", error);
    throw error;
  }
};
