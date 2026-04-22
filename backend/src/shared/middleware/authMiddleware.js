import jwt from "jsonwebtoken";
import User from "../../features/auth/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    console.log("authMiddleware called");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No auth header or not Bearer");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified, user ID:", decoded.id);

    // Use await instead of .then() for Express 5 compatibility
    const user = await User.findById(decoded.id).select("-password");
    console.log("User found:", !!user, user?.role);

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is blocked
    if (user.status === "blocked") {
      console.log("User is blocked");
      return res.status(401).json({
        success: false,
        message: "Your account has been blocked. Please contact administrator.",
      });
    }

    req.user = user;
    console.log("req.user set, calling next()");
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
