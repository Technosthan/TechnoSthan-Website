import User from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";



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

  if (!isEmail(contact) && !isMobile(contact)) {
    throw new Error("Invalid email or mobile number");
  }

  const existingUser = isEmail(contact)
    ? await User.findOne({ email: contact.trim().toLowerCase() })
    : await User.findOne({ mobile: contact.trim() });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = {
    name,
    password: hashedPassword,
    role: "student", // Default role
  };

  if (isEmail(contact)) {
    userData.email = contact.trim().toLowerCase();
  } else {
    userData.mobile = contact.trim();
  }

  const user = new User(userData);
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
  };

  return { user: userResponse, token };
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
  };

  return { user: userData, token };
};

// Google OAuth
export const googleAuth = async (profile) => {
  const { id, displayName, emails, photos } = profile;

  let user = await User.findOne({ googleId: id });

  if (!user) {
    // Check if user exists with same email
    if (emails && emails.length > 0) {
      user = await User.findOne({ email: emails[0].value.toLowerCase() });
      if (user) {
        // Link Google account
        user.googleId = id;
        user.picture = photos && photos.length > 0 ? photos[0].value : null;
        await user.save();
      } else {
        // Create new user
        user = new User({
          name: displayName,
          email: emails[0].value.toLowerCase(),
          googleId: id,
          picture: photos && photos.length > 0 ? photos[0].value : null,
          role: "student",
        });
        await user.save();
      }
    }
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
    picture: user.picture,
  };

  return { user: userData, token };
};

export const setupGoogleStrategy = () => {
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
