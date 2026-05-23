import User from "../auth/user.model.js";
import UserServicePermission from "./userServicePermission.model.js";
import { getOrCreateAuthSettings } from "./authSettings.service.js";

const resolveEffectiveValue = (overrideValue, globalValue) =>
  overrideValue !== null && overrideValue !== undefined
    ? overrideValue
    : globalValue;

export const getUserServicePermissions = async ({
  search,
  role,
  status,
  serviceEnabled,
  page = 1,
  pageSize = 20,
}) => {
  const query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { mobile: searchRegex },
    ];
  }

  const users = await User.find(query)
    .select("name email mobile role status createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const userIds = users.map((user) => user._id);
  const overrides = await UserServicePermission.find({
    userId: { $in: userIds },
    isDeleted: false,
  }).lean();

  const authSettings = await getOrCreateAuthSettings();
  const globalEmailOtp = authSettings.emailOtp?.enabled ?? true;
  const globalPhoneOtp = authSettings.phoneOtp?.enabled ?? true;
  const globalWhatsapp = authSettings.whatsapp?.enabled ?? true;

  const overrideMap = overrides.reduce((acc, override) => {
    acc[override.userId.toString()] = override;
    return acc;
  }, {});

  const usersWithPermissions = users.map((user) => {
    const override = overrideMap[user._id.toString()] || {};
    const emailOtpEnabled = resolveEffectiveValue(
      override.emailOtpEnabled,
      globalEmailOtp,
    );
    const phoneOtpEnabled = resolveEffectiveValue(
      override.phoneOtpEnabled,
      globalPhoneOtp,
    );
    const whatsappLoginEnabled = resolveEffectiveValue(
      override.whatsappLoginEnabled,
      globalWhatsapp,
    );
    return {
      ...user,
      emailOtpEnabled,
      phoneOtpEnabled,
      whatsappLoginEnabled,
      serviceOverrides: {
        emailOtpEnabled: override.emailOtpEnabled,
        phoneOtpEnabled: override.phoneOtpEnabled,
        whatsappLoginEnabled: override.whatsappLoginEnabled,
      },
    };
  });

  let filtered = usersWithPermissions;
  if (serviceEnabled) {
    if (serviceEnabled === "emailOtp") {
      filtered = filtered.filter((user) => user.emailOtpEnabled);
    }
    if (serviceEnabled === "phoneOtp") {
      filtered = filtered.filter((user) => user.phoneOtpEnabled);
    }
    if (serviceEnabled === "whatsappLogin") {
      filtered = filtered.filter((user) => user.whatsappLoginEnabled);
    }
  }

  const total = filtered.length;
  const skip = (Number(page) - 1) * Number(pageSize);
  const paginated = filtered.slice(skip, skip + Number(pageSize));

  return {
    data: paginated,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
  };
};

export const updateUserServicePermissions = async (userId, updates) => {
  const validFields = [
    "emailOtpEnabled",
    "phoneOtpEnabled",
    "whatsappLoginEnabled",
  ];
  const payload = {};
  for (const key of validFields) {
    if (updates[key] !== undefined) {
      payload[key] = updates[key];
    }
  }

  if (!Object.keys(payload).length) {
    throw new Error("No valid permission updates supplied");
  }

  const permission = await UserServicePermission.findOneAndUpdate(
    { userId, isDeleted: false },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return permission;
};

export const bulkUpdateUserServicePermissions = async (userIds, updates) => {
  const validFields = [
    "emailOtpEnabled",
    "phoneOtpEnabled",
    "whatsappLoginEnabled",
  ];
  const payload = {};
  for (const key of validFields) {
    if (updates[key] !== undefined) {
      payload[key] = updates[key];
    }
  }

  if (!Object.keys(payload).length) {
    throw new Error("No valid permission updates supplied for bulk update");
  }

  await UserServicePermission.updateMany(
    { userId: { $in: userIds }, isDeleted: false },
    { $set: payload },
  );

  return true;
};

export const getUserServicePermissionByUserId = async (userId) => {
  const override = await UserServicePermission.findOne({
    userId,
    isDeleted: false,
  }).lean();

  const authSettings = await getOrCreateAuthSettings();
  const globalEmailOtp = authSettings.emailOtp?.enabled ?? true;
  const globalPhoneOtp = authSettings.phoneOtp?.enabled ?? true;
  const globalWhatsapp = authSettings.whatsapp?.enabled ?? true;

  return {
    ...override,
    emailOtpEnabled: resolveEffectiveValue(
      override?.emailOtpEnabled,
      globalEmailOtp,
    ),
    phoneOtpEnabled: resolveEffectiveValue(
      override?.phoneOtpEnabled,
      globalPhoneOtp,
    ),
    whatsappLoginEnabled: resolveEffectiveValue(
      override?.whatsappLoginEnabled,
      globalWhatsapp,
    ),
  };
};
