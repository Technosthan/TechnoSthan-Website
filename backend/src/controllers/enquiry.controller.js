import {
  createEnquiry as saveEnquiry,
  getAllEnquiries,
  updateEnquiryStatus as changeStatus,
  deleteEnquiry as removeEnquiry,
} from "../services/enquiry.service.js";

export const createEnquiry = async (req, res, next) => {
  try {
    const { fullName, email, phone, category, interestedArea, message } =
      req.body;
    if (
      !fullName ||
      !email ||
      !phone ||
      !category ||
      !interestedArea ||
      !message
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const enquiry = await saveEnquiry({
      fullName,
      email,
      phone,
      category,
      interestedArea,
      message,
    });
    res
      .status(201)
      .json({ message: "Enquiry submitted successfully", enquiry });
  } catch (error) {
    next(error);
  }
};

export const getEnquiries = async (_req, res, next) => {
  try {
    const enquiries = await getAllEnquiries();
    res.json({ enquiries });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const enquiry = await changeStatus(id, status);
    res.json({ message: "Status updated", enquiry });
  } catch (error) {
    next(error);
  }
};

export const deleteEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await removeEnquiry(id);
    res.json({ message: "Enquiry deleted", enquiry });
  } catch (error) {
    next(error);
  }
};
