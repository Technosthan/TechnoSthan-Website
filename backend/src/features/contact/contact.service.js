import prisma from "../../core/database/prisma.js";

export const createContact = async (data) => {
  return await prisma.contact.create({
    data,
  });
};