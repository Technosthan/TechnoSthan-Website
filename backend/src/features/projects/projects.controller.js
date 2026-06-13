import {
  createProject,
  getAllProjects,
} from "./projects.service.js";

export const create = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await createProject(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getAllProjects();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};