import prisma from "../../core/database/prisma.js";

export const createProject = async (data) => {
  return prisma.project.create({
    data,
  });
};

export const getAllProjects = async () => {
  return prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};