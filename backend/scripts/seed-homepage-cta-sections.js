import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runHomepageCtaSectionsSeed } from "../src/features/homepageCtaSections/homepageCtaSections.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const main = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
    });

    const result = await runHomepageCtaSectionsSeed();
    console.log("[homepageCtaSections] seed result:", JSON.stringify(result, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("[homepageCtaSections] seed failed:", error.message);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
};

main();

