import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: function () {
        return !this.mobile; // Email required only if mobile not present
      },
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    mobile: {
      type: String,
      required: function () {
        return !this.email; // Mobile required only if email not present
      },
      unique: true,
      trim: true,
      sparse: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if googleId is not present (traditional registration)
        return !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer", "student"],
      default: "student",
    },
    permissions: {
      editContent: {
        type: Boolean,
        default: false,
      },
      deleteContent: {
        type: Boolean,
        default: false,
      },
      manageUsers: {
        type: Boolean,
        default: false,
      },
      manageQuizzes: {
        type: Boolean,
        default: false,
      },
      viewAnalytics: {
        type: Boolean,
        default: false,
      },
      manageSettings: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: ["inactive", "active", "blocked"],
      default: "inactive",
    },
    googleId: {
      type: String,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    picture: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
