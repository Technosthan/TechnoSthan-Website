require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const EmailConfig = require("./models/EmailConfig");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const cfg = await EmailConfig.findOne().sort({ updatedAt: -1 }).lean();
    console.log("EmailConfig from DB:");
    console.log(cfg);
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err && err.message ? err.message : err);
    process.exit(1);
  }
})();
