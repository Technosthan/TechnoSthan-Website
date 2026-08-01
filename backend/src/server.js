import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { migrateAISettings } from "./features/admin/aiMigration.service.js";
import { validateCloudinaryConfig } from "./shared/services/cloudinary.service.js";
import { seedHomepageServices } from "./features/homepageServices/homepageServices.seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 7000;

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

    /* -------------------------- Start Server -------------------------- */

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    /* ---------------------- Run AI Migration ---------------------- */

    setImmediate(async () => {
      try {
        await migrateAISettings();
        console.log("✅ AI settings migration completed");
      } catch (error) {
        console.error("❌ AI migration failed:", error.message);
      }
    });

    setImmediate(async () => {
      try {
        await seedHomepageServices();
        console.log("✅ Homepage services seed completed");
      } catch (error) {
        console.error("❌ Homepage services seed failed:", error.message);
      }
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
