import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoose from "mongoose";
import { migrateAISettings } from "./features/admin/aiMigration.service.js";

// Initialize email transporter on startup
import { getEmailTransporter } from "./features/admin/announcement.service.js";

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Initialize email transporter
    try {
      getEmailTransporter();
    } catch (error) {
      console.error("Email transporter initialization failed:", error);
    }

    // Run AI settings migration
    try {
      await migrateAISettings();
    } catch (error) {
      console.error("AI migration failed:", error);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Error:", err.message);
  });
