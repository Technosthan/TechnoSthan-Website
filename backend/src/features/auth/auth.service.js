import User from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import PendingUser from "./pendingUser.model.js";
import ResetToken from "./resetToken.model.js";
import crypto from "crypto";

const isEmail = (contact) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(contact);
};

const isMobile = (contact) => {
  const mobileRegex = /^\d{10}$/; // Assuming 10 digit mobile
  return mobileRegex.test(contact);
};

export const registerUser = async (data) => {
  const { name, contact, password } = data;

  if (!name || !name.trim()) {
    throw new Error("Name is required");
  }

  if (!isEmail(contact) && !isMobile(contact)) {
    throw new Error("Invalid email or mobile number");
  }

  // Check if user already exists in main DB
  const existingUser = isEmail(contact)
    ? await User.findOne({ email: contact.trim().toLowerCase() })
    : await User.findOne({ mobile: contact.trim() });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Check if pending user exists
  const existingPending = isEmail(contact)
    ? await PendingUser.findOne({ email: contact.trim().toLowerCase() })
    : await PendingUser.findOne({ mobile: contact.trim() });

  if (existingPending) {
    throw new Error(
      "Registration already in progress. Please check your email/SMS for OTP.",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const pendingData = {
    name,
    password: hashedPassword,
  };

  if (isEmail(contact)) {
    pendingData.email = contact.trim().toLowerCase();
  } else {
    pendingData.mobile = contact.trim();
  }

  const pendingUser = new PendingUser(pendingData);
  await pendingUser.save();

  return {
    pendingUserId: pendingUser._id,
    contactType: isEmail(contact) ? "email" : "phone",
  };
};

export const loginUser = async (data) => {
  const { contact, password } = data;

  if (!isEmail(contact) && !isMobile(contact)) {
    throw new Error("Invalid email or mobile number");
  }

  const user = isEmail(contact)
    ? await User.findOne({ email: contact.trim().toLowerCase() })
    : await User.findOne({ mobile: contact.trim() });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  console.log("Login user:", user);
  console.log("Email verified:", user.emailVerified);
  console.log("Phone verified:", user.phoneVerified);

  // Check if user is verified
  if (!user.emailVerified || !user.phoneVerified) {
    throw new Error("Please verify your email and phone before logging in.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Check if user is active
  if (user.status !== "active") {
    throw new Error("Please verify your email and phone first.");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Return user data without password
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
  };

  return { user: userData, token };
};

export const finalizeRegistration = async (pendingUserId) => {
  const pendingUser = await PendingUser.findById(pendingUserId);
  if (!pendingUser) {
    throw new Error("Pending user not found");
  }

  if (!pendingUser.emailVerified || !pendingUser.phoneVerified) {
    throw new Error("Both email and phone must be verified");
  }

  // Create user in main DB
  const userData = {
    name: pendingUser.name,
    password: pendingUser.password,
    email: pendingUser.email,
    mobile: pendingUser.mobile,
    role: "student",
    emailVerified: true,
    phoneVerified: true,
    status: "active",
  };

  const user = new User(userData);
  await user.save();

  // Delete pending user
  await PendingUser.findByIdAndDelete(pendingUserId);

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
  };

  return { user: userResponse, token };
};

// Forgot Password
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("User not found");
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(token, 10);

  // Save reset token
  const resetToken = new ResetToken({
    userId: user._id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });
  await resetToken.save();

  return { resetToken: token, user };
};

// Reset Password
export const resetPassword = async (token, newPassword) => {
  // Find valid reset token
  const resetToken = await ResetToken.findOne({
    expiresAt: { $gt: new Date() },
  });

  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  // Verify token
  const isValid = await bcrypt.compare(token, resetToken.token);
  if (!isValid) {
    throw new Error("Invalid reset token");
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(resetToken.userId, { password: hashedPassword });

  // Delete reset token
  await ResetToken.findByIdAndDelete(resetToken._id);

  return { success: true };
};

// Google OAuth
export const googleAuth = async (profile) => {
  const { id, displayName, emails, photos } = profile;

  if (!displayName) {
    throw new Error("Display name is required for Google login");
  }

  let user = await User.findOne({ googleId: id });

  if (!user) {
    // Check if user exists with same email
    if (emails && emails.length > 0) {
      user = await User.findOne({ email: emails[0].value.toLowerCase() });
      if (user) {
        // Link Google account
        user.googleId = id;
        user.picture = photos && photos.length > 0 ? photos[0].value : null;
        user.status = "active";
        await user.save();
      } else {
        // Create new user
        user = new User({
          name: displayName,
          email: emails[0].value.toLowerCase(),
          googleId: id,
          picture: photos && photos.length > 0 ? photos[0].value : null,
          role: "student",
          status: "active",
        });
        await user.save();
      }
    }
  }

  // Check if user is blocked
  if (user.status === "blocked") {
    throw new Error(
      "Your account has been blocked. Please contact administrator.",
    );
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
    picture: user.picture,
  };

  return { user: userData, token };
};

export const verifyOTPForPending = async (pendingUserId, otp, method) => {
  const pendingUser = await PendingUser.findById(pendingUserId);

  if (!pendingUser) throw new Error("Pending user not found");

  const contact = method === "email" ? pendingUser.email : pendingUser.phone;

  const result = await verifyOTP(
    contact,
    otp,
    method === "email" ? "verify-email" : "verify-phone",
  );

  if (result.success) {
    if (method === "email") {
      pendingUser.emailVerified = true;
    } else {
      pendingUser.phoneVerified = true;
    }
    await pendingUser.save();
  }

  return result;
};

export const setupGoogleStrategy = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Google OAuth not configured - skipping strategy setup");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const result = await googleAuth(profile);
          done(null, result);
        } catch (error) {
          done(error, null);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
