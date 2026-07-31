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

const mapProject = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  imageUrl:
    project.imageUrl || project.image || null,
  displayOrder: project.displayOrder,
  isActive: project.isActive,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

export const listProjects = async ({
  activeOnly = true,
} = {}) => {
  const projects = await prisma.project.findMany({
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

  return projects.map(mapProject);
};

export const createProject = async (
  data,
  file
) => {
  const uploadedImage = await saveUploadedImage(
    file,
    "projects"
  );

  const project = await prisma.project.create({
    data: {
      title: sanitize(data.title),
      description: sanitize(data.description),
      image: uploadedImage?.url || null,
      imageUrl: uploadedImage?.url || null,
      imageAssetId: uploadedImage?.assetId || null,
      imageStorage: uploadedImage?.storage || null,
      displayOrder: toInt(data.displayOrder, 0),
      isActive: toBoolean(data.isActive, true),
    },
  });

  return mapProject(project);
};

export const updateProject = async (
  id,
  data,
  file
) => {
  const existing = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const uploadedImage = file
    ? await saveUploadedImage(file, "projects")
    : null;

  if (uploadedImage) {
    await deleteStoredImage({
      assetId: existing.imageAssetId,
      storage: existing.imageStorage,
    });
  }

  const project = await prisma.project.update({
    where: {
      id,
    },
    data: {
      title: sanitize(data.title) || existing.title,
      description:
        sanitize(data.description) || existing.description,
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

  return mapProject(project);
};

export const updateProjectStatus = async (
  id,
  isActive
) => {
  const project = await prisma.project.update({
    where: {
      id,
    },
    data: {
      isActive: toBoolean(isActive, true),
    },
  });

  return mapProject(project);
};

export const deleteProject = async (id) => {
  const existing = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  await deleteStoredImage({
    assetId: existing.imageAssetId,
    storage: existing.imageStorage,
  });

  await prisma.project.delete({
    where: {
      id,
    },
  });

  return { id };
};
