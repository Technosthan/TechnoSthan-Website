import User from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

export const registerUser = async (data) => {
  const { name, email, password } = data;
  console.log("Register User Data:", { name, email, password });

  // Validate email
  if (!email) {
    throw new Error("Email is required");
  }
  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("Enter a valid email address");
  }
  // Allow-list domain check
  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "icloud.com",
    "hotmail.com",
  ];
  const domain = normalizedEmail.split("@")[1];
  if (!allowedDomains.includes(domain)) {
    throw new Error(
      "Only Gmail, Yahoo, Outlook, iCloud, or Hotmail emails are allowed",
    );
  }

  // Check for existing user
  const existingUser = await User.findOne({
    email: normalizedEmail,
  });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return { user };
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error("User already exists");
    }
    throw error;
  }
};

export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Return user data without password
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return { user: userData, token };
};

export const googleAuth = async (idToken) => {
  try {
    // Initialize Google OAuth2 client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google token");
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email (from traditional registration)
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId;
        existingUser.picture = picture || existingUser.picture;
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        user = await User.create({
          name,
          email: email.toLowerCase(),
          googleId,
          picture,
          role: "student", // Default role for Google signups
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
    };

    return { user: userData, token };
  } catch (error) {
    console.error("Google authentication error:", error);
    throw new Error("Google authentication failed");
  }
};
