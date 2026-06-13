import prisma from "../../core/database/prisma.js";

export const createInquiry = async (data) => {
  return await prisma.inquiry.create({
    data,
  });
};