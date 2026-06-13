import prisma from "../../core/database/prisma.js";

export const createTestimonial = async (data) => {
  return prisma.testimonial.create({
    data,
  });
};

export const getAllTestimonials = async () => {
  return prisma.testimonial.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};