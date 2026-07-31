import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
  updateProjectStatus,
} from "./projects.service.js";

export const getPublic = async (
  req,
  res,
  next
) => {
  try {
    const result = await listProjects({
      activeOnly: true,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (
  req,
  res,
  next
) => {
  try {
    const result = await listProjects({
      activeOnly: false,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req,
  res,
  next
) => {
  try {
    const result = await createProject(
      req.body,
      req.file
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateProject(
      req.params.id,
      req.body,
      req.file
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateProjectStatus(
      req.params.id,
      req.body.isActive
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req,
  res,
  next
) => {
  try {
    await deleteProject(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
