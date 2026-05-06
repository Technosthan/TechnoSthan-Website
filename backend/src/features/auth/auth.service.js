import User from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import PendingUser from "./pendingUser.model.js";
import { sendOTP } from "./otp.service.js";
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

  let finalName = name;
  if (!finalName || !finalName.trim()) {
    // Derive a name from contact when not provided (email local-part)
    if (isEmail(contact)) {
      finalName = contact.split("@")[0] || "User";
    } else {
      finalName = contact || "User";
    }
  }

  // TEMPORARILY DISABLED: Phone authentication system
  // if (!isEmail(contact) && !isMobile(contact)) {
  //   throw new Error("Invalid email or mobile number");
  // }
  if (!isEmail(contact)) {
    throw new Error("Only email registration is allowed at this time");
  }

  // Check if user already exists in main DB
  // TEMPORARILY DISABLED: Phone authentication system
  // const existingUser = isEmail(contact)
  //   ? await User.findOne({ email: contact.trim().toLowerCase() })
  //   : await User.findOne({ mobile: contact.trim() });
  const existingUser = await User.findOne({
    email: contact.trim().toLowerCase(),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Check if pending user exists
  // TEMPORARILY DISABLED: Phone authentication system
  // const existingPending = isEmail(contact)
  //   ? await PendingUser.findOne({ email: contact.trim().toLowerCase() })
  //   : await PendingUser.findOne({ mobile: contact.trim() });
  const existingPending = await PendingUser.findOne({
    email: contact.trim().toLowerCase(),
  });

  if (existingPending) {
    throw new Error(
      "Registration already in progress. Please check your email for OTP.",
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const pendingData = {
    name: finalName,
    password: hashedPassword,
  };

  // TEMPORARILY DISABLED: Phone authentication system
  // if (isEmail(contact)) {
  //   pendingData.email = contact.trim().toLowerCase();
  // } else {
  //   pendingData.mobile = contact.trim();
  // }
  pendingData.email = contact.trim().toLowerCase();

  const pendingUser = new PendingUser(pendingData);
  await pendingUser.save();

  return {
    pendingUserId: pendingUser._id,
    contactType: "email", // Always email now
  };
};

export const loginUser = async (data) => {
  const { contact, password } = data;

  // TEMPORARILY DISABLED: Phone authentication system
  // if (!isEmail(contact) && !isMobile(contact)) {
  //   throw new Error("Invalid email or mobile number");
  // }
  if (!isEmail(contact)) {
    throw new Error("Only email login is allowed at this time");
  }

  // TEMPORARILY DISABLED: Phone authentication system
  // const user = isEmail(contact)
  //   ? await User.findOne({ email: contact.trim().toLowerCase() })
  //   : await User.findOne({ mobile: contact.trim() });
  const user = await User.findOne({ email: contact.trim().toLowerCase() });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  console.log("Login user:", user);
  console.log("Email verified:", user.emailVerified);
  // TEMPORARILY DISABLED: Phone authentication system
  // console.log("Phone verified:", user.phoneVerified);

  // Check if user is verified
  // TEMPORARILY DISABLED: Phone authentication system
  // if (!user.emailVerified || !user.phoneVerified) {
  //   throw new Error("Please verify your email and phone before logging in.");
  // }
  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Check if user is active
  // TEMPORARILY DISABLED: Phone authentication system
  // if (user.status !== "active") {
  //   throw new Error("Please verify your email and phone first.");
  // }
  if (user.status !== "active") {
    throw new Error("Please verify your email first.");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Return user data without password
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    // TEMPORARILY DISABLED: Phone authentication system
    // mobile: user.mobile,
    role: user.role,
    status: user.status,
  };

  return { user: userData, token };
};

export const authenticateUser = async ({ contact, password }) => {
  // TEMPORARILY DISABLED: Phone authentication system
  // Detect contact type
  // const contactType = isEmail(contact) ? "email" : "phone";
  if (!isEmail(contact)) {
    throw new Error("Only email authentication is allowed at this time");
  }

  // Check if user exists
  // TEMPORARILY DISABLED: Phone authentication system
  // const existingUser = isEmail(contact)
  //   ? await User.findOne({ email: contact.trim().toLowerCase() })
  //   : await User.findOne({ mobile: contact.trim() });
  const existingUser = await User.findOne({
    email: contact.trim().toLowerCase(),
  });

  if (existingUser) {
    // User exists - verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Check if user is verified and active
    // TEMPORARILY DISABLED: Phone authentication system
    // if (!existingUser.emailVerified || !existingUser.phoneVerified) {
    //   throw new Error("Please verify your email and phone before logging in.");
    // }
    if (!existingUser.emailVerified) {
      throw new Error("Please verify your email before logging in.");
    }

    if (existingUser.status !== "active") {
      throw new Error("Account is not active.");
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
        // TEMPORARILY DISABLED: Phone authentication system
        // phone: existingUser.mobile, // Map mobile to phone for frontend
        role: existingUser.role,
        status: existingUser.status,
      },
    };
  } else {
    // User doesn't exist - create a PendingUser and start registration
    const hashedPassword = await bcrypt.hash(password, 10);

    const pendingData = { password: hashedPassword };

    // TEMPORARILY DISABLED: Phone authentication system
    // if (contactType === "email") {
    //   pendingData.email = contact.trim().toLowerCase();
    //   // Extract name from email local-part
    //   pendingData.name = contact.split("@")[0] || "User";
    // } else {
    //   pendingData.mobile = contact.trim();
    //   // Use phone as temporary name until email is provided
    //   pendingData.name = contact.trim();
    // }
    pendingData.email = contact.trim().toLowerCase();
    // Extract name from email local-part
    pendingData.name = contact.split("@")[0] || "User";

    const pendingUser = new PendingUser(pendingData);
    await pendingUser.save();

    // TEMPORARILY DISABLED: Phone authentication system
    // const method = contactType === "email" ? "email" : "sms";
    const method = "email";

    await sendOTP(
      contact,
      "email", // Always email
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
