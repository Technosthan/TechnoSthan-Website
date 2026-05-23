import mongoose from "mongoose";

const userServicePermissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    emailOtpEnabled: {
      type: Boolean,
      default: null,
    },
    phoneOtpEnabled: {
      type: Boolean,
      default: null,
    },
    whatsappLoginEnabled: {
      type: Boolean,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const UserServicePermission = mongoose.model(
  "UserServicePermission",
  userServicePermissionSchema,
);

export default UserServicePermission;
