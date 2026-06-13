import prisma from "../../core/database/prisma.js";

export const createService = async (data) => {
  return prisma.service.create({
    data,
  });
};

export const getAllServices = async () => {
  return prisma.service.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};