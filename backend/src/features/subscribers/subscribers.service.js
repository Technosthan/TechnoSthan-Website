import prisma from "../../core/database/prisma.js";

export const createSubscriber = async (email) => {
  return prisma.subscriber.create({
    data: { email },
  });
};

export const getAllSubscribers = async () => {
  return prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
};
