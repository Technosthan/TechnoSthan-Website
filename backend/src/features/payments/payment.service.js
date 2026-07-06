import crypto from "crypto";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";

const getCheckoutAmount = (program) => {
  const amount = program.discountFees || program.fees;
  return Number(amount);
};

const getRazorpayClient = async () => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  try {
    const { default: Razorpay } = await import("razorpay");
    return new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  } catch (_error) {
    return null;
  }
};

export const createEnrollmentWithOrder = async ({ userId, programId }) => {
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) {
    const error = new Error("Program not found");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_programId: { userId, programId } },
    update: {
      status: "PENDING",
      paymentStatus: "PENDING",
    },
    create: {
      userId,
      programId,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  const amount = getCheckoutAmount(program);
  const payment = await prisma.payment.create({
    data: {
      userId,
      programId,
      enrollmentId: enrollment.id,
      amount,
      currency: "INR",
      provider: "RAZORPAY",
      status: "PENDING",
    },
  });

  const razorpay = await getRazorpayClient();
  if (razorpay) {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `enrollment_${enrollment.id}`,
      notes: {
        enrollmentId: enrollment.id,
        programId,
        userId,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerOrderId: order.id },
    });

    return {
      enrollment,
      payment: { ...payment, providerOrderId: order.id },
      order,
      program,
    };
  }

  const order = {
    id: `order_mock_${payment.id}`,
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `enrollment_${enrollment.id}`,
  };

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerOrderId: order.id },
  });

  return {
    enrollment,
    payment: { ...payment, providerOrderId: order.id },
    order,
    program,
  };
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!env.RAZORPAY_KEY_SECRET) {
    return true;
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
};

export const markPaymentSuccess = async ({
  orderId,
  paymentId,
  signature,
}) => {
  if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
    const error = new Error("Invalid payment signature");
    error.statusCode = 400;
    throw error;
  }

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: orderId },
    include: { enrollment: true },
  });

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerPaymentId: paymentId,
      providerSignature: signature,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await prisma.enrollment.update({
    where: { id: payment.enrollmentId },
    data: {
      status: "ACTIVE",
      paymentStatus: "PAID",
    },
  });

  return updatedPayment;
};
