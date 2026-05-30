import * as formService from "./form.service.js";

export const createForm = async (req, res) => {
  try {
    const form = await formService.createForm(req.body, req.user._id);
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAdminForms = async (req, res) => {
  try {
    const forms = await formService.getAdminForms();
    res.json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateForm = async (req, res) => {
  try {
    const form = await formService.updateForm(req.params.formId, req.body);
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteForm = async (req, res) => {
  try {
    await formService.deleteForm(req.params.formId);
    res.json({ success: true, message: "Form deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFormSubmissions = async (req, res) => {
  try {
    const submissions = await formService.getFormSubmissions(req.params.formId);
    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubmissionStatus = async (req, res) => {
  try {
    const submission = await formService.updateSubmissionStatus(
      req.params.formId,
      req.params.submissionId,
      req.body.status,
    );
    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPublicForms = async (req, res) => {
  try {
    const role = req.user?.role;
    const forms = await formService.getPublicForms(role);
    res.json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFormBySlug = async (req, res) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitForm = async (req, res) => {
  try {
    const submission = await formService.submitForm(
      req.params.formId,
      req.body.values,
      req.user,
    );
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
