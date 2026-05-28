require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const EmailConfig = require("./models/EmailConfig");

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("MONGO_URI not set in .env");
      process.exit(1);
    }

    await mongoose.connect(uri);

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      console.error("EMAIL_USER or EMAIL_PASS missing in .env");
      await mongoose.disconnect();
      process.exit(1);
    }

    const updated = await EmailConfig.findOneAndUpdate(
      {},
      { emailUser, emailPass },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    const maskedPass = (updated.emailPass || "").replace(/.(?=.{4})/g, "*");
    console.log("EmailConfig updated in DB:");
    console.log({
      emailUser: updated.emailUser,
      emailPass: maskedPass,
      _id: updated._id,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(
      "Error updating EmailConfig:",
      err && err.message ? err.message : err,
    );
    process.exit(1);
  }
})();
