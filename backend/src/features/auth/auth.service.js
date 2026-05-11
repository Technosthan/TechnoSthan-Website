import User from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import PendingUser from "./pendingUser.model.js";
import { sendOTP } from "./otp.service.js";
import ResetToken from "./resetToken.model.js";
import crypto from "crypto";
import OTP from "./otp.model.js";
import {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  sendEmailOTP,
  sendSMSOTP,
} from "./otp.service.js";

const isEmail = (contact) => {
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  return emailRegex.test(contact);
};

const isMobile = (contact) => {
  const mobileRegex = /^\d{10}$/; // Assuming 10 digit mobile
  return mobileRegex.test(contact);
};

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const normalizePhone = (phone) =>
  typeof phone === "string" ? phone.replace(/[^\d+]/g, "").trim() : "";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const registerUser = async (data) => {
  const { name, contact, password } = data;

  let finalName = name;
  if (!finalName || !finalName.trim()) {
    // Derive a name from contact when not provided (email local-part)
    if (isEmail(contact)) {
      finalName = contact.split("@")[0] || "User";
    } else {
      finalName = contact || "User";
    }
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
      "Registration already in progress. Please check your email or SMS for OTP.",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const pendingData = {
    name: finalName,
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

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  if (user.status === "blocked") {
    throw new Error("Your account has been blocked. Please contact administrator.");
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
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    telegramLinked: user.telegramLinked,
    telegramUsername: user.telegramUsername,
    picture: user.picture,
    hasPassword: typeof user.password === "string" && user.password.length > 0,
  };

  return {
    user: userData,
    token,
    requiresVerification: !user.emailVerified || !user.phoneVerified,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
  };
};

export const authenticateUser = async ({ contact, password }) => {
  // Detect contact type
  const contactType = isEmail(contact) ? "email" : "phone";

  // Check if user exists
  const existingUser = isEmail(contact)
    ? await User.findOne({ email: contact.trim().toLowerCase() })
    : await User.findOne({ mobile: contact.trim() });

  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }

  if (existingUser) {
    // User exists - verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    if (existingUser.status === "blocked") {
      throw new Error("Your account has been blocked. Please contact administrator.");
    }

    // Generate token
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return {
      isExistingUser: true,
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        mobile: existingUser.mobile,
        role: existingUser.role,
        status: existingUser.status,
        emailVerified: existingUser.emailVerified,
        phoneVerified: existingUser.phoneVerified,
        telegramLinked: existingUser.telegramLinked,
        telegramUsername: existingUser.telegramUsername,
        picture: existingUser.picture,
        hasPassword:
          typeof existingUser.password === "string" &&
          existingUser.password.length > 0,
      },
      requiresVerification:
        !existingUser.emailVerified || !existingUser.phoneVerified,
      emailVerified: existingUser.emailVerified,
      phoneVerified: existingUser.phoneVerified,
    };
  } else {
    // User doesn't exist - create a PendingUser and start registration
    const hashedPassword = await bcrypt.hash(password, 10);

    const pendingData = { password: hashedPassword };

    if (contactType === "email") {
      pendingData.email = contact.trim().toLowerCase();
      // Extract name from email local-part
      pendingData.name = contact.split("@")[0] || "User";
    } else {
      pendingData.mobile = contact.trim();
      // Use phone as temporary name until email is provided
      pendingData.name = contact.trim();
    }

    const pendingUser = new PendingUser(pendingData);
    await pendingUser.save();

    const method = contactType === "email" ? "email" : "sms";

    await sendOTP(
      contact,
      contactType,
      method,
      pendingUser._id,
      pendingData.name,
    );

    return {
      isExistingUser: false,
      pendingUserId: pendingUser._id,
      contactType,
    };
  }
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
    whatsappNumber: pendingUser.mobile, // Link WhatsApp to mobile
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

export const changePassword = async (
  userId,
  { currentPassword, newPassword, confirmPassword },
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match");
  }

  if (user.password) {
    if (!currentPassword) {
      throw new Error("Current password is required");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }
  }

  const isSameAsOld =
    user.password && (await bcrypt.compare(newPassword, user.password));
  if (isSameAsOld) {
    throw new Error("New password must be different from the current password");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return {
    success: true,
    message: user.googleId
      ? "Password set successfully"
      : "Password changed successfully",
  };
};

// Google OAuth
export const googleAuth = async (profile) => {
  const { id, displayName, emails, photos } = profile;
  const profileEmail = normalizeEmail(emails?.[0]?.value || "");

  if (!displayName) {
    throw new Error("Display name is required for Google login");
  }

  if (!profileEmail) {
    throw new Error("Google account did not provide an email address");
  }

  let user = await User.findOne({ googleId: id });

  if (!user) {
    // Find existing user by email regardless of case
    const emailRegex = new RegExp(`^${escapeRegExp(profileEmail)}$`, "i");
    user = await User.findOne({ email: emailRegex });

    if (user) {
      // Link Google account to existing user
      user.googleId = id;
      user.picture = photos && photos.length > 0 ? photos[0].value : null;
      user.status = "active";
      await user.save();
    } else {
      // Create new user
      user = new User({
        name: displayName,
        email: profileEmail,
        googleId: id,
        picture: photos && photos.length > 0 ? photos[0].value : null,
        role: "student",
        status: "active",
      });
      await user.save();
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
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    telegramLinked: user.telegramLinked,
    telegramUsername: user.telegramUsername,
    requiresVerification: !user.emailVerified || !user.phoneVerified,
    hasPassword: typeof user.password === "string" && user.password.length > 0,
  };

  return { user: userData, token };
};

export const sendProfileEmailVerificationOTP = async (userId, email) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!normalizedEmail || !isEmail(normalizedEmail)) {
    throw new Error("Invalid email address");
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: userId },
  });
  if (existingUser) {
    throw new Error("Email is already in use by another user");
  }

  if (user.email === normalizedEmail && user.emailVerified) {
    throw new Error("This email is already verified");
  }

  const recentOtp = await OTP.findOne({
    userId,
    method: "email",
    verified: false,
    createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
  });
  if (recentOtp) {
    throw new Error("Please wait before requesting another OTP");
  }

  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.create({
    contact: normalizedEmail,
    contactType: "email",
    otp: hashedOtp,
    method: "email",
    expiresAt,
    userId,
  });

  user.emailOtp = hashedOtp;
  user.emailOtpExpires = expiresAt;
  await user.save();

  await sendEmailOTP(normalizedEmail, otp, user.name);

  return {
    message: "OTP sent to your email address",
    expiresIn: "10 minutes",
  };
};

export const verifyProfileEmailOTP = async (userId, otp) => {
  const user = await User.findById(userId).select("+emailOtp");
  if (!user) {
    throw new Error("User not found");
  }

  const otpRecord = await OTP.findOne({
    userId,
    method: "email",
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error("OTP not found or expired");
  }

  if (otpRecord.attempts >= 3) {
    throw new Error("Maximum verification attempts exceeded");
  }

  const isValid = await verifyOTPHash(otp, otpRecord.otp);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error("Invalid OTP");
  }

  otpRecord.verified = true;
  await otpRecord.save();

  user.email = normalizeEmail(otpRecord.contact);
  user.emailVerified = true;
  user.emailOtp = null;
  user.emailOtpExpires = null;
  if (user.emailVerified && user.phoneVerified) {
    user.status = "active";
  }
  await user.save();

  return {
    message: "Email verified successfully",
    user: {
      id: user._id,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      telegramLinked: user.telegramLinked,
      telegramUsername: user.telegramUsername,
      status: user.status,
    },
  };
};

export const sendProfilePhoneVerificationOTP = async (userId, phone) => {
  const normalizedPhone = normalizePhone(phone);
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!normalizedPhone || !/^\+?[1-9]\d{9,14}$/.test(normalizedPhone)) {
    throw new Error("Invalid phone number");
  }

  const existingUser = await User.findOne({
    mobile: normalizedPhone,
    _id: { $ne: userId },
  });
  if (existingUser) {
    throw new Error("Phone number is already in use by another user");
  }

  if (user.mobile === normalizedPhone && user.phoneVerified) {
    throw new Error("This phone number is already verified");
  }

  const recentOtp = await OTP.findOne({
    userId,
    method: "sms",
    verified: false,
    createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
  });
  if (recentOtp) {
    throw new Error("Please wait before requesting another OTP");
  }

  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.create({
    contact: normalizedPhone,
    contactType: "phone",
    otp: hashedOtp,
    method: "sms",
    expiresAt,
    userId,
  });

  user.phoneOtp = hashedOtp;
  user.phoneOtpExpires = expiresAt;
  await user.save();

  await sendSMSOTP(normalizedPhone, otp);

  return {
    message: "OTP sent to your phone number",
    expiresIn: "10 minutes",
  };
};

export const verifyProfilePhoneOTP = async (userId, otp) => {
  const user = await User.findById(userId).select("+phoneOtp");
  if (!user) {
    throw new Error("User not found");
  }

  const otpRecord = await OTP.findOne({
    userId,
    method: "sms",
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error("OTP not found or expired");
  }

  if (otpRecord.attempts >= 3) {
    throw new Error("Maximum verification attempts exceeded");
  }

  const isValid = await verifyOTPHash(otp, otpRecord.otp);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error("Invalid OTP");
  }

  otpRecord.verified = true;
  await otpRecord.save();

  user.mobile = normalizePhone(otpRecord.contact);
  user.phoneVerified = true;
  user.phoneOtp = null;
  user.phoneOtpExpires = null;
  if (user.emailVerified && user.phoneVerified) {
    user.status = "active";
  }
  await user.save();

  return {
    message: "Phone number verified successfully",
    user: {
      id: user._id,
      mobile: user.mobile,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      telegramLinked: user.telegramLinked,
      telegramUsername: user.telegramUsername,
      status: user.status,
    },
  };
};

export const verifyOTPForPending = async (pendingUserId, otp, method) => {
  const pendingUser = await PendingUser.findById(pendingUserId);

  if (!pendingUser) throw new Error("Pending user not found");

  const contact = method === "email" ? pendingUser.email : pendingUser.phone;

  const result = await verifyOTP(contact, otp);

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

// Email Update with OTP
export const sendEmailUpdateOTP = async (userId, newEmail) => {
  // Validate new email format
  const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(newEmail)) {
    throw new Error("Invalid email format");
  }

  // Check if email is already in use by another user
  const existingUser = await User.findOne({
    email: newEmail.toLowerCase(),
    _id: { $ne: userId },
  });
  if (existingUser) {
    throw new Error("Email is already in use by another user");
  }

  // Get user details
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Import here to avoid circular dependency
  const EmailUpdateRequest = (await import("./emailUpdateRequest.model.js"))
    .default;
  const { generateOTP, sendEmailOTP } = await import("./otp.service.js");

  // Check if there's already a pending request for this user/email
  const existingRequest = await EmailUpdateRequest.findOne({
    userId,
    newEmail: newEmail.toLowerCase(),
  });

  if (existingRequest) {
    // Check if OTP is still valid (not expired and attempts not exceeded)
    if (
      existingRequest.otpExpiresAt > new Date() &&
      existingRequest.attempts < 3
    ) {
      // Resend existing OTP
      await sendEmailOTP(newEmail, existingRequest.otp, user.name);
      return { success: true, message: "OTP sent to new email address" };
    } else {
      // Delete expired request
      await EmailUpdateRequest.findByIdAndDelete(existingRequest._id);
    }
  }

  // Generate new OTP
  const otp = generateOTP();

  // Create new email update request
  const emailUpdateRequest = new EmailUpdateRequest({
    userId,
    newEmail: newEmail.toLowerCase(),
    otp,
  });

  await emailUpdateRequest.save();

  // Send OTP to new email
  await sendEmailOTP(newEmail, otp, user.name);

  return { success: true, message: "OTP sent to new email address" };
};

export const verifyEmailUpdateOTP = async (userId, otp) => {
  // Import here to avoid circular dependency
  const EmailUpdateRequest = (await import("./emailUpdateRequest.model.js"))
    .default;

  // Find the email update request
  const request = await EmailUpdateRequest.findOne({
    userId,
    otpExpiresAt: { $gt: new Date() },
  });

  if (!request) {
    throw new Error("No valid email update request found or OTP expired");
  }

  // Check attempts
  if (request.attempts >= 3) {
    await EmailUpdateRequest.findByIdAndDelete(request._id);
    throw new Error("Maximum OTP attempts exceeded. Please request a new OTP.");
  }

  // Update attempts
  request.attempts += 1;
  request.lastAttemptAt = new Date();
  await request.save();

  // Verify OTP
  if (request.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Update user's email
  await User.findByIdAndUpdate(userId, {
    email: request.newEmail,
    emailVerified: true, // Mark as verified since OTP was sent and verified
  });

  // Delete the request
  await EmailUpdateRequest.findByIdAndDelete(request._id);

  return { success: true, message: "Email updated successfully" };
};
