const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  ROLE_LIST,
  ROLES,
  getRolePermissions,
  normalizeRole,
} = require("../constants/rbac");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
        return !this.googleId;
      },
      select: false,
    },

    googleId: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ROLE_LIST,
      default: ROLES.USER,
      set: normalizeRole,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    permissions: {
      type: [String],
      default: undefined,
    },
    lastActivityAt: {
      type: Date,
      default: null,
      index: true,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
      index: true,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  this.role = normalizeRole(this.role);
  this.permissions = getRolePermissions(this.role);

  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
