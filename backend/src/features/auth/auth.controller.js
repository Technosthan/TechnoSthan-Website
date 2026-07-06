import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import {
  buildPublicUser,
  createSharedSession,
  getCurrentUser,
  loginUser,
  registerUser,
} from "./auth.service.js";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return req.headers["x-auth-token"] || req.headers["x-technosthan-token"] || null;
};

const sendAuthSession = (res, statusCode, session, message) => {
  return sendSuccess(
    res,
    statusCode,
    {
      success: true,
      token: session.token,
      user: buildPublicUser(session.user),
    },
    message,
  );
};

export const registerController = asyncHandler(async (req, res) => {
  const { name, email, phone, password, category, avatar } = req.body;
  console.log("Register body:", req.body);
  const session = await registerUser({
    name,
    email,
    phone,
    password,
    category,
    avatar,
  });

  console.log("Created user:", session.user.id);
  return sendAuthSession(res, 201, session, "Account created");
});

export const loginController = asyncHandler(async (req, res) => {
  const { emailOrPhone, password, token } = req.body;

  if (token) {
    const session = await createSharedSession(token);
    return sendAuthSession(res, 200, session, "Signed in");
  }

  const session = await loginUser({ emailOrPhone, password });
  return sendAuthSession(res, 200, session, "Signed in");
});

export const meController = asyncHandler(async (req, res) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const session = await getCurrentUser(token);
  return sendAuthSession(res, 200, { ...session, token }, "Session loaded");
});

export const logoutController = asyncHandler(async (_req, res) => {
  return sendSuccess(res, 200, { loggedOut: true }, "Logged out");
});
