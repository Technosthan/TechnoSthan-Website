import { prisma } from "../../config/db.js";

export const createEnquiry = async ({
  fullName,
  email,
  phone,
  category,
  interestedArea,
  message,
}) => {
  return prisma.enquiry.create({
    data: { fullName, email, phone, category, interestedArea, message },
  });
};

export const getAllEnquiries = async () => {
  return prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
};

export const updateEnquiryStatus = async (id, status) => {
  return prisma.enquiry.update({ where: { id }, data: { status } });
};

export const deleteEnquiry = async (id) => {
  return prisma.enquiry.delete({ where: { id } });
};
