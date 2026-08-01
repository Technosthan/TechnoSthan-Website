import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { runEmpoweringCardsSeed } from "../src/features/empoweringCards/empoweringCards.seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const main = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  });

  try {
    const result = await runEmpoweringCardsSeed();
    console.log("[seed-empowering-cards] completed:", JSON.stringify(result));
  } finally {
    await mongoose.disconnect();
  }
};

main().catch(async (error) => {
  console.error("[seed-empowering-cards] fatal:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
