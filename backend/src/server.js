import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app.js";
import { migrateAISettings } from "./features/admin/aiMigration.service.js";
import { validateCloudinaryConfig } from "./shared/services/cloudinary.service.js";

const PORT = process.env.PORT || 5000;

/* ----------------------------- MongoDB Connect ---------------------------- */

const connectDB = async () => {
  try {
    validateCloudinaryConfig();
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log("✅ MongoDB Connected");

    /* ------------------------- MongoDB Events ------------------------- */

    mongoose.connection.on("connected", () => {
      console.log("🟢 MongoDB connection established");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🟡 MongoDB disconnected");
    });

    /* ---------------------- Run AI Migration ---------------------- */

    try {
      await migrateAISettings();
      console.log("✅ AI settings migration completed");
    } catch (error) {
      console.error("❌ AI migration failed:", error.message);
    }

    /* -------------------------- Start Server -------------------------- */

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);

    // Retry DB connection after 5 sec
    console.log("🔄 Retrying MongoDB connection in 5 seconds...");

    setTimeout(connectDB, 5000);
  }
};

/* ---------------------------- Start Database ---------------------------- */

connectDB();

/* ---------------------------- Crash Handlers ---------------------------- */

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});
