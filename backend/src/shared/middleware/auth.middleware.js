import { prisma } from "../../config/db.js";
import { verifyAuthToken } from "../utils/jwt.js";

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return req.headers["x-auth-token"] || req.headers["x-technosthan-token"] || null;
};

export const authenticate = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyAuthToken(token);
    const userId = payload.sub || payload.id;
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", detail: error.message });
  }
};

export const optionalAuth = async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAuthToken(token);
    const userId = payload.sub || payload.id;
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email: payload.email } });

    if (user) {
      req.user = user;
      req.auth = payload;
    }
  } catch (_error) {
    // ignore optional auth errors
  }

  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
