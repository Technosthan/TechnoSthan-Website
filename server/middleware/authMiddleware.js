const jwt = require("jsonwebtoken");

// 🔐 PROTECT ROUTE (LOGIN REQUIRED)
exports.protect = (req, res, next) => {
  try {
    let token;

    // ✅ Authorization header se token lena (Bearer format)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ Agar token nahi mila
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, access denied"
      });
    }

    // ✅ Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👉 user data attach karo
    req.user = decoded;

    next();

  } catch (err) {
    console.error("Auth Error:", err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};


// ADMIN ONLY ROUTE
exports.admin = (req, res, next) => {
  try {
    // ❌ Agar user nahi hai
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // ❌ Agar admin nahi hai
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only"
      });
    }

    next();

  } catch (err) {
    console.error("Admin Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};