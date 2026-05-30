import crypto from "crypto";
import Form from "./form.model.js";
import Submission from "./submission.model.js";

const buildSlug = (text) => {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${normalized || "form"}-${crypto.randomBytes(3).toString("hex")}`;
};

const ensureUniqueSlug = async (slug, excludedId = null) => {
  let uniqueSlug = slug;
  let attempt = 0;
  while (
    await Form.findOne({
      publicSlug: uniqueSlug,
      ...(excludedId ? { _id: { $ne: excludedId } } : {}),
    })
  ) {
    attempt += 1;
    uniqueSlug = `${slug}-${crypto.randomBytes(2).toString("hex")}-${attempt}`;
  }
  return uniqueSlug;
};

export const createForm = async (payload, userId) => {
  const form = new Form({
    title: payload.title,
    description: payload.description || "",
    externalLink: payload.externalLink || null,
    fields: payload.fields || [],
    roleVisibility:
      payload.roleVisibility?.length > 0 ? payload.roleVisibility : ["student"],
    active: payload.active !== false,
    creatorId: userId,
  });

  const slug = buildSlug(payload.title || "form");
  form.publicSlug = await ensureUniqueSlug(slug);

  return await form.save();
};

export const getAdminForms = async () => {
  return await Form.find().sort({ createdAt: -1 });
};

export const getFormById = async (formId) => {
  return await Form.findById(formId);
};

export const updateForm = async (formId, payload) => {
  const existing = await Form.findById(formId);
  if (!existing) {
    throw new Error("Form not found");
  }

  existing.title = payload.title || existing.title;
  existing.description = payload.description || existing.description;
  existing.externalLink = payload.externalLink || null;
  existing.fields = payload.fields || [];
  existing.roleVisibility =
    payload.roleVisibility?.length > 0
      ? payload.roleVisibility
      : existing.roleVisibility;
  existing.active = payload.active !== false;

  if (payload.publicSlug) {
    existing.publicSlug = await ensureUniqueSlug(payload.publicSlug, formId);
  }

  return await existing.save();
};

export const deleteForm = async (formId) => {
  return await Form.findByIdAndDelete(formId);
};

export const getFormSubmissions = async (formId) => {
  return await Submission.find({ formId })
    .populate("userId", "name email role")
    .sort({ createdAt: -1 });
};

export const updateSubmissionStatus = async (formId, submissionId, status) => {
  const submission = await Submission.findOne({
    _id: submissionId,
    formId,
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  submission.status = status;
  return await submission.save();
};

export const getPublicForms = async (role) => {
  const filter = { active: true };
  if (role) {
    filter.roleVisibility = { $in: [role] };
  }
  return await Form.find(filter).sort({ createdAt: -1 });
};

export const getFormBySlug = async (slug) => {
  return await Form.findOne({ publicSlug: slug, active: true });
};

const normalizeFieldValue = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};

export const submitForm = async (formId, values, user) => {
  const form = await Form.findById(formId);
  if (!form) {
    throw new Error("Form not found");
  }
  if (form.externalLink) {
    throw new Error(
      "This form uses an external link and cannot be submitted here.",
    );
  }

  const normalizedValues = {};
  for (const field of form.fields) {
    const rawValue = values?.[field.key];
    const normalized = normalizeFieldValue(rawValue);

    if (field.required) {
      const isEmpty =
        normalized === undefined ||
        normalized === null ||
        normalized === "" ||
        (Array.isArray(normalized) && normalized.length === 0);
      if (isEmpty) {
        throw new Error(`Field "${field.label}" is required.`);
      }
    }

    normalizedValues[field.key] = normalized;
  }

  const submission = new Submission({
    formId,
    userId: user?._id,
    userName: user?.name || "",
    userEmail: user?.email || "",
    role: user?.role,
    values: normalizedValues,
  });

  return await submission.save();
};
