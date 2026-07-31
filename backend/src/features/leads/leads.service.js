import prisma from "../../core/database/prisma.js";

export const getLeadOverview = async () => {
  const [contacts, inquiries, subscribers] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    contacts,
    inquiries,
    subscribers,
    totals: {
      contacts: await prisma.contact.count(),
      inquiries: await prisma.inquiry.count(),
      subscribers: await prisma.subscriber.count(),
    },
  };
};
