require("dotenv").config();
const mongoose = require("mongoose");
const Campaign = require("../models/Campaign");
const { normalizeCampaignRoute } = require("../utils/campaignRoutes");

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const campaigns = await Campaign.find({}, "_id displayRoute").lean();
  const updates = campaigns
    .map((campaign) => {
      try {
        return {
          id: campaign._id,
          displayRoute: normalizeCampaignRoute(campaign.displayRoute || "/"),
        };
      } catch (err) {
        return {
          id: campaign._id,
          displayRoute: "/",
        };
      }
    })
    .filter((campaign) => campaign.displayRoute);

  let updatedCount = 0;
  for (const campaign of updates) {
    const result = await Campaign.updateOne(
      { _id: campaign.id },
      { $set: { displayRoute: campaign.displayRoute } },
    );
    updatedCount += result.modifiedCount || 0;
  }

  console.log(`Backfilled displayRoute for ${updatedCount} campaign(s).`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Campaign route backfill failed:", err);
  process.exitCode = 1;
});
