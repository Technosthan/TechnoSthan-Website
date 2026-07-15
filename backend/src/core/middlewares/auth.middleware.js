import jwt from "jsonwebtoken";
import prisma from "../database/prisma.js";

const authMiddleware = async (
  req,
  res,
  next
) => {
  const header =
    req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const secret =
      process.env.JWT_SECRET || "technosthan-secret";
    const payload = jwt.verify(token, secret);

    const account = await prisma.student.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Account not found",
      });
    }

    req.tokenUser = payload;
    req.user = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      profileImage: account.profileImage || null,
      profileImageUrl: account.profileImageUrl || null,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;

export const requireAdmin = (
  req,
  res,
  next
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};
