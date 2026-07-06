import { prisma } from "../../config/db.js";
import { signAuthToken, verifyAuthToken } from "../../shared/utils/jwt.js";

const loadBcrypt = async () => {
  const bcryptModule = await import("bcryptjs").catch(() => null);
  return bcryptModule?.default || bcryptModule;
};

const normalizePhone = (phone) => String(phone || "").replace(/\s+/g, "");

const buildUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  category: user.category,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUser = async ({
  name,
  email,
  phone,
  password,
  category = null,
  avatar = null,
}) => {
  const bcrypt = await loadBcrypt();
  if (!bcrypt) {
    throw new Error("Password hashing library is unavailable.");
  }

  const normalizedPhone = normalizePhone(phone);
  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const existingByPhone = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });
  if (existingByPhone) {
    const error = new Error("Phone already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: normalizedPhone,
      password: hashedPassword,
      role: "STUDENT",
      avatar,
      category,
    },
  });

  const token = signAuthToken(user);
  return { user: buildUserPayload(user), token };
};

export const loginUser = async ({ emailOrPhone, password }) => {
  const bcrypt = await loadBcrypt();
  if (!bcrypt) {
    throw new Error("Password hashing library is unavailable.");
  }

  const normalizedPhone = normalizePhone(emailOrPhone);
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrPhone }, { phone: normalizedPhone }],
    },
  });

  if (!user || !user.password) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = signAuthToken(user);
  return { user: buildUserPayload(user), token };
};

export const getCurrentUser = async (token) => {
  const payload = verifyAuthToken(token);
  const userId = payload.sub || payload.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return { user: buildUserPayload(user), payload };
};

export const createSharedSession = async (token) => {
  const payload = verifyAuthToken(token);
  const userId = payload.sub || payload.id;
  const bcrypt = await loadBcrypt();
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      return { user: buildUserPayload(user), token, payload };
    }
  }

  if (!payload.email) {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    throw error;
  }

  const normalizedPhone = normalizePhone(payload.phone || "");
  if (!normalizedPhone) {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    throw error;
  }

  const hashedFallbackPassword = bcrypt
    ? await bcrypt.hash("shared-token-session", 10)
    : "shared-token-session";

  const user = await prisma.user.upsert({
    where: { email: payload.email },
    update: {
      name: payload.name || payload.email.split("@")[0],
      phone: normalizedPhone,
      avatar: payload.avatar || null,
      role: payload.role || "STUDENT",
    },
    create: {
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      phone: normalizedPhone,
      password: hashedFallbackPassword,
      avatar: payload.avatar || null,
      category: payload.category || null,
      role: payload.role || "STUDENT",
    },
  });

  return { user: buildUserPayload(user), token, payload };
};

export const buildPublicUser = buildUserPayload;
