import mongoose from "mongoose";

const announcementDismissalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    announcement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Announcement",
      required: true,
    },
    dismissedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

announcementDismissalSchema.index(
  { user: 1, announcement: 1 },
  { unique: true },
);

const AnnouncementDismissal = mongoose.model(
  "AnnouncementDismissal",
  announcementDismissalSchema,
);

export default AnnouncementDismissal;
