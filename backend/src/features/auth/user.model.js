import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
