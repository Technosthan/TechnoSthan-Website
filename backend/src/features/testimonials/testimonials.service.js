import prisma from "../../core/database/prisma.js";
import {
  deleteStoredImage,
  saveUploadedImage,
} from "../../core/utils/media.js";

const toInt = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "yes", "on"].includes(
    String(value).toLowerCase()
  );
};

const sanitize = (value) =>
  typeof value === "string" ? value.trim() : value;

const mapTestimonial = (testimonial) => ({
  id: testimonial.id,
  clientName: testimonial.clientName,
  designation: testimonial.designation,
  company: testimonial.company,
  feedback: testimonial.feedback,
  imageUrl:
    testimonial.imageUrl ||
    testimonial.image ||
    null,
  displayOrder: testimonial.displayOrder,
  isActive: testimonial.isActive,
  createdAt: testimonial.createdAt,
  updatedAt: testimonial.updatedAt,
});

export const listTestimonials = async ({
  activeOnly = true,
} = {}) => {
  const testimonials = await prisma.testimonial.findMany({
    where: activeOnly
      ? {
          isActive: true,
        }
      : undefined,
    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return testimonials.map(mapTestimonial);
};

export const getTestimonialById = async (
  id
) => prisma.testimonial.findUnique({ where: { id } });

export const createTestimonial = async (
  data,
  file
) => {
  const uploadedImage = await saveUploadedImage(
    file,
    "testimonials"
  );

  const testimonial = await prisma.testimonial.create({
    data: {
      clientName: sanitize(data.clientName),
      designation: sanitize(data.designation) || null,
      company: sanitize(data.company) || null,
      feedback: sanitize(data.feedback),
      image: uploadedImage?.url || null,
      imageUrl: uploadedImage?.url || null,
      imageAssetId: uploadedImage?.assetId || null,
      imageStorage: uploadedImage?.storage || null,
      displayOrder: toInt(data.displayOrder, 0),
      isActive: toBoolean(data.isActive, true),
    },
  });

  return mapTestimonial(testimonial);
};

export const updateTestimonial = async (
  id,
  data,
  file
) => {
  const existing = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Testimonial not found");
    error.statusCode = 404;
    throw error;
  }

  const uploadedImage = file
    ? await saveUploadedImage(file, "testimonials")
    : null;

  if (uploadedImage) {
    await deleteStoredImage({
      assetId: existing.imageAssetId,
      storage: existing.imageStorage,
    });
  }

  const testimonial = await prisma.testimonial.update({
    where: {
      id,
    },
    data: {
      clientName:
        sanitize(data.clientName) ||
        existing.clientName,
      designation:
        data.designation === undefined
          ? existing.designation
          : sanitize(data.designation) || null,
      company:
        data.company === undefined
          ? existing.company
          : sanitize(data.company) || null,
      feedback:
        sanitize(data.feedback) || existing.feedback,
      image: uploadedImage?.url || existing.image,
      imageUrl:
        uploadedImage?.url || existing.imageUrl || existing.image,
      imageAssetId:
        uploadedImage?.assetId || existing.imageAssetId,
      imageStorage:
        uploadedImage?.storage || existing.imageStorage,
      displayOrder:
        data.displayOrder === undefined
          ? existing.displayOrder
          : toInt(data.displayOrder, existing.displayOrder),
      isActive:
        data.isActive === undefined
          ? existing.isActive
          : toBoolean(data.isActive, existing.isActive),
    },
  });

  return mapTestimonial(testimonial);
};

export const updateTestimonialStatus = async (
  id,
  isActive
) => {
  const testimonial = await prisma.testimonial.update({
    where: {
      id,
    },
    data: {
      isActive: toBoolean(isActive, true),
    },
  });

  return mapTestimonial(testimonial);
};

export const deleteTestimonial = async (
  id
) => {
  const existing = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Testimonial not found");
    error.statusCode = 404;
    throw error;
  }

  await deleteStoredImage({
    assetId: existing.imageAssetId,
    storage: existing.imageStorage,
  });

  await prisma.testimonial.delete({
    where: {
      id,
    },
  });

  return { id };
};
