import {
  createForm as createFormService,
  getAdminForms as getAdminFormsService,
  getFormById as getFormByIdService,
  updateForm as updateFormService,
  deleteForm as deleteFormService,
  getFormResponses as getFormResponsesService,
  getFormResponseAnalysis as getFormResponseAnalysisService,
  getFormResponseById as getFormResponseByIdService,
  deleteFormResponse as deleteFormResponseService,
  exportFormResponses as exportFormResponsesService,
  getFormBySlug as getFormBySlugService,
  importFormFromFile as importFormFromFileService,
  sendFormVerificationOtp as sendFormVerificationOtpService,
  revealFormResponseSecret as revealFormResponseSecretService,
  submitForm as submitFormService,
  verifyFormVerificationOtp as verifyFormVerificationOtpService,
} from "./form.service.js";

export const createForm = async (req, res) => {
  try {
    const form = await createFormService(req.body, req.user._id);
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAdminForms = async (req, res) => {
  try {
    const forms = await getAdminFormsService();
    res.json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminFormById = async (req, res) => {
  try {
    const form = await getFormByIdService(req.params.formId);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateForm = async (req, res) => {
  try {
    const form = await updateFormService(req.params.formId, req.body);
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const importFormFromFile = async (req, res) => {
  try {
    const file = req.file || req.files?.[0];
    const data = await importFormFromFileService(file);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteForm = async (req, res) => {
  try {
    await deleteFormService(req.params.formId);
    res.json({ success: true, message: "Form deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFormSubmissions = async (req, res) => {
  try {
    const submissions = await getFormResponsesService(req.params.formId, req.query);
    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFormResponseAnalysis = async (req, res) => {
  try {
    const analysis = await getFormResponseAnalysisService(req.params.formId, req.query);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFormSubmissionById = async (req, res) => {
  try {
    const submission = await getFormResponseByIdService(
      req.params.formId,
      req.params.responseId,
    );
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Response not found" });
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFormSubmission = async (req, res) => {
  try {
    await deleteFormResponseService(req.params.formId, req.params.responseId);
    res.json({ success: true, message: "Response deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const revealFormResponseSecret = async (req, res) => {
  try {
    const payload = await revealFormResponseSecretService({
      formId: req.params.formId,
      responseId: req.params.responseId,
      questionId: req.body?.questionId,
      adminId: req.user?._id,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
    });

    res.json({ success: true, data: payload });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const exportFormSubmissions = async (req, res) => {
  try {
    const csv = await exportFormResponsesService(req.params.formId, req.query);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=form-${req.params.formId}-responses.csv`,
    );
    res.send(csv);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPublicFormBySlug = async (req, res) => {
  try {
    const form = await getFormBySlugService(req.params.slug);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found or not live",
      });
    }
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendPublicFormVerificationOtp = async (req, res) => {
  try {
    const result = await sendFormVerificationOtpService({
      slug: req.params.slug,
      challengeType: req.params.kind || req.body?.challengeType,
      questionId: req.body?.questionId,
      value: req.body?.value,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    const statusCode =
      /wait before requesting another OTP/i.test(error.message || "") ? 429 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const verifyPublicFormVerificationOtp = async (req, res) => {
  try {
    const result = await verifyFormVerificationOtpService({
      slug: req.params.slug,
      challengeType: req.params.kind || req.body?.challengeType,
      questionId: req.body?.questionId,
      value: req.body?.value,
      otp: req.body?.otp,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    const statusCode =
      /not found or expired|maximum otp attempts exceeded/i.test(error.message || "")
        ? 400
        : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const submitPublicForm = async (req, res) => {
  try {
    const adminBaseUrl =
      process.env.ADMIN_DASHBOARD_URL ||
      process.env.FRONTEND_URL ||
      process.env.VITE_PUBLIC_URL ||
      req.headers.origin ||
      `${req.protocol}://${req.get("host")}`;
    const publicBaseUrl =
      process.env.FRONTEND_URL ||
      process.env.VITE_PUBLIC_URL ||
      req.headers.origin ||
      `${req.protocol}://${req.get("host")}`;
    const submission = await submitFormService({
      slug: req.params.slug,
      body: req.body,
      files: req.files || [],
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || "",
      adminUrl: `${adminBaseUrl}/admin/dashboard/forms`,
      publicBaseUrl,
    });

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      data: submission,
    });
  } catch (error) {
    if (error.statusCode === 503) {
      return res.status(503).json({
        success: false,
        message: "Upload service is not configured",
      });
    }

    if (error.code === "FORM_EXPIRED") {
      return res.status(410).json({
        success: false,
        code: "FORM_EXPIRED",
        message: error.message,
      });
    }

    if (
      error.code === "DUPLICATE_SUBMISSION" ||
      error.statusCode === 409 ||
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE_SUBMISSION",
        message: "You have already filled this form.",
      });
    }

    const isValidationError =
      error.statusCode === 400 ||
      /Question ".+" is required/i.test(error.message || "") ||
      /must be a valid/i.test(error.message || "") ||
      /Maximum file size allowed/i.test(error.message || "") ||
      /File uploads are disabled/i.test(error.message || "");

    const statusCode = isValidationError ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message:
        statusCode === 400
          ? error.message || "Unable to submit form. Please check your entries."
          : "Failed to submit form",
    });
  }
};
