const adminOnly = (req, res, next) => {
  console.log("adminOnly middleware called, req.user:", req.user);
  if (!req.user) {
    console.log("No req.user found");
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    console.log("User role is not admin:", req.user.role);
    return res.status(403).json({
      success: false,
      message: "Access denied (Admin only)",
    });
  }

  console.log("Admin check passed, calling next()");
  next();
};

export default adminOnly;
