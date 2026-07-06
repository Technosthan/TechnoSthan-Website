import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const getJwtSecret = () => {
  if (!env.JWT_SECRET) {
    throw new Error(
      "JWT secret is not configured. Set JWT_SECRET or TECHNOSTHAN_SHARED_JWT_SECRET.",
    );
  }

  return env.JWT_SECRET;
};

export const signAuthToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: env.JWT_EXPIRES_IN },
  );
};

export const verifyAuthToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

export const decodeAuthToken = (token) => {
  return jwt.decode(token);
};
