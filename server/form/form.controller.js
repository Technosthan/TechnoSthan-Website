const {
  createForm: createFormService,
  getAdminForms: getAdminFormsService,
  getFormById: getFormByIdService,
  getFormExportById: getFormExportByIdService,
  updateForm: updateFormService,
  deleteForm: deleteFormService,
  getFormResponses: getFormResponsesService,
  getFormResponseAnalysis: getFormResponseAnalysisService,
  getFormResponseById: getFormResponseByIdService,
  deleteFormResponse: deleteFormResponseService,
  exportFormResponses: exportFormResponsesService,
  getFormBySlug: getFormBySlugService,
  sendFormVerification: sendFormVerificationService,
  verifyFormVerification: verifyFormVerificationService,
  submitForm: submitFormService,
  revealFormResponseSecret: revealFormResponseSecretService,
  importFormFile: importFormFileService,
} = require("./form.service.js");

const createForm = async (req, res) => {
  try {
    const creatorId = req.user?.id || req.user?.userId || req.user?._id || null;
    const form = await createFormService(req.body, creatorId);
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

const getAdminForms = async (req, res) => {
  try {
    const forms = await getAdminFormsService();
    res.json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminFormById = async (req, res) => {
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

const getAdminFormExport = async (req, res) => {
  try {
    const exportData = await getFormExportByIdService(req.params.formId);
    if (!exportData) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }
    res.json({ success: true, data: exportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateForm = async (req, res) => {
  try {
    const form = await updateFormService(req.params.formId, req.body);
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

const deleteForm = async (req, res) => {
  try {
    await deleteFormService(req.params.formId);
    res.json({ success: true, message: "Form deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getFormSubmissions = async (req, res) => {
  try {
    const submissions = await getFormResponsesService(req.params.formId, req.query);
    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFormResponseAnalysis = async (req, res) => {
  try {
    const analysis = await getFormResponseAnalysisService(req.params.formId, req.query);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFormSubmissionById = async (req, res) => {
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

const deleteFormSubmission = async (req, res) => {
  try {
    await deleteFormResponseService(req.params.formId, req.params.responseId);
    res.json({ success: true, message: "Response deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const revealFormResponseSecret = async (req, res) => {
  try {
    const revealed = await revealFormResponseSecretService({
      formId: req.params.formId,
      responseId: req.params.responseId,
      questionId: req.body?.questionId,
      adminUser: req.user || null,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || "",
    });
    res.json({ success: true, data: revealed });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const importFormFile = async (req, res) => {
  try {
    const result = await importFormFileService(req.file);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const exportFormSubmissions = async (req, res) => {
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

const getPublicFormBySlug = async (req, res) => {
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

const sendPublicFormVerification = async (req, res) => {
  try {
    const result = await sendFormVerificationService({
      slug: req.params.slug,
      questionId: req.body?.questionId,
      destination: req.body?.destination,
      type: req.body?.type,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyPublicFormVerification = async (req, res) => {
  try {
    const result = await verifyFormVerificationService({
      slug: req.params.slug,
      questionId: req.body?.questionId,
      destination: req.body?.destination,
      type: req.body?.type,
      otp: req.body?.otp,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

const submitPublicForm = async (req, res) => {
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
      adminUrl: `${adminBaseUrl}/admin/forms`,
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

module.exports = {
  createForm,
  getAdminForms,
  getAdminFormById,
  getAdminFormExport,
  updateForm,
  deleteForm,
  getFormSubmissions,
  getFormResponseAnalysis,
  getFormSubmissionById,
  deleteFormSubmission,
  exportFormSubmissions,
  getPublicFormBySlug,
  sendPublicFormVerification,
  verifyPublicFormVerification,
  submitPublicForm,
  revealFormResponseSecret,
  importFormFile,
};
