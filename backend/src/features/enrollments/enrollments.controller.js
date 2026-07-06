import { prisma } from "../../config/db.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import { createEnrollmentWithOrder } from "../payments/payment.service.js";
import { markPaymentSuccess } from "../payments/payment.service.js";

export const createEnrollmentController = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  const user = req.user;

  const result = await createEnrollmentWithOrder({
    userId: user.id,
    programId,
  });

  return sendSuccess(res, 201, result, "Enrollment created");
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  const payment = await markPaymentSuccess({ orderId, paymentId, signature });
  return sendSuccess(res, 200, { payment }, "Payment verified");
});

export const getMyProgramsController = asyncHandler(async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
    include: {
      program: {
        include: {
          curriculumModules: {
            include: { lessons: true },
            orderBy: { order: "asc" },
          },
          projects: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return sendSuccess(res, 200, { enrollments });
});

export const getMyPaymentsController = asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user.id },
    include: { program: true, enrollment: true },
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, 200, { payments });
});

export const getMyProfileController = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      enrollments: {
        include: { program: true },
      },
      payments: true,
    },
  });

  return sendSuccess(res, 200, { user });
});
