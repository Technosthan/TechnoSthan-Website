import {
  createNavbarOrbitItem,
  deleteNavbarOrbitItem,
  getAdminNavbarOrbitItems,
  getPublicNavbarOrbitItems,
  reorderNavbarOrbitItems,
  resetNavbarOrbitGroup,
  updateNavbarOrbitItem,
  updateNavbarOrbitItemStatus,
  listNavbarOrbitItems,
} from "./navbarOrbit.service.js";

export const getPublic = async (req, res, next) => {
  try {
    const result = await getPublicNavbarOrbitItems();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (req, res, next) => {
  try {
    const result = await getAdminNavbarOrbitItems();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const result = await createNavbarOrbitItem(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await updateNavbarOrbitItem(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const result = await updateNavbarOrbitItemStatus(
      req.params.id,
      req.body?.isActive
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteNavbarOrbitItem(req.params.id);

    res.json({
      success: true,
      data: result.item,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const reorder = async (req, res, next) => {
  try {
    const result = await reorderNavbarOrbitItems(
      req.body.groupKey,
      req.body.orderedIds
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resetGroup = async (req, res, next) => {
  try {
    const result = await resetNavbarOrbitGroup(req.body.groupKey);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

