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
      enum: ["student", "admin"],
      default: "student",
    },
    googleId: {
      type: String,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    picture: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
