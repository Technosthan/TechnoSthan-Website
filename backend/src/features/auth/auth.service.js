import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../core/database/prisma.js";
import {
  deleteStoredImage,
  saveUploadedImage,
} from "../../core/utils/media.js";

const secret =
  process.env.JWT_SECRET || "technosthan-secret";

const createToken = (payload) =>
  jwt.sign(payload, secret, {
    expiresIn: "7d",
  });

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const mapAccount = (account) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role,
  profileImage: account.profileImage || null,
  profileImageUrl: account.profileImageUrl || null,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

const createAccountToken = (account) =>
  createToken({
    email: account.email,
    role: account.role,
    name: account.name,
  });

export const loginUser = async ({
  email,
  password,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const account = await prisma.student.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!account) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  const isValid = await bcrypt.compare(
    password,
    account.passwordHash
  );

  if (!isValid) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const user = mapAccount(account);
  return {
    token: createAccountToken(user),
    user,
  };
};

export const registerStudent = async ({
  name,
  email,
  password,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.student.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existing) {
    const error = new Error("Account already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const account = await prisma.student.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "student",
    },
  });

  const user = mapAccount(account);
  return {
    token: createAccountToken(user),
    user,
  };
};

export const getCurrentAccount = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const account = await prisma.student.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!account) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  return mapAccount(account);
};

export const updateAccountProfile = async (
  currentEmail,
  payload,
  file
) => {
  const normalizedEmail = normalizeEmail(currentEmail);
  const existing = await prisma.student.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!existing) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  const nextName =
    typeof payload?.name === "string"
      ? payload.name.trim()
      : existing.name;

  if (!nextName) {
    const error = new Error("Name cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  const nextImage = file
    ? await saveUploadedImage(file, "accounts")
    : null;

  if (nextImage && existing.profileImageAssetId) {
    await deleteStoredImage({
      assetId: existing.profileImageAssetId,
      storage: existing.profileImageStorage,
    });
  }

  const account = await prisma.student.update({
    where: {
      email: normalizedEmail,
    },
    data: {
      name: nextName,
      profileImage: nextImage?.url || existing.profileImage || null,
      profileImageUrl: nextImage?.url || existing.profileImageUrl || null,
      profileImageAssetId:
        nextImage?.assetId || existing.profileImageAssetId || null,
      profileImageStorage:
        nextImage?.storage || existing.profileImageStorage || null,
    },
  });

  const user = mapAccount(account);
  return {
    token: createAccountToken(user),
    user,
  };
};
