import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import { sendEnquiryNotificationEmails } from "../../shared/services/email.service.js";
import {
  createEnquiry,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from "./enquiry.service.js";

export const createEnquiryController = asyncHandler(async (req, res) => {
  const { fullName, email, phone, category, interestedArea, message } =
    req.body;

  const enquiry = await createEnquiry({
    fullName,
    email,
    phone,
    category,
    interestedArea,
    message,
  });

  try {
    await sendEnquiryNotificationEmails(enquiry);
  } catch (emailError) {
    console.error("Enquiry email notification failed:", emailError);
  }

  return sendSuccess(
    res,
    201,
    { enquiry },
    "Your enquiry has been submitted successfully.",
  );
});

export const getEnquiriesController = asyncHandler(async (_req, res) => {
  const enquiries = await getAllEnquiries();
  return sendSuccess(res, 200, { enquiries });
});

export const updateEnquiryStatusController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const enquiry = await updateEnquiryStatus(id, status);
  return sendSuccess(res, 200, { enquiry }, "Status updated");
});

export const deleteEnquiryController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const enquiry = await deleteEnquiry(id);
  return sendSuccess(res, 200, { enquiry }, "Enquiry deleted");
});
