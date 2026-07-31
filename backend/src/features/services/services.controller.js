import {
  createServiceRecord,
  deleteService,
  getAllServices,
  updateServiceRecord,
  updateServiceStatus,
} from "./services.service.js";

export const getPublic = async (req, res, next) => {
  try {
    const result = await getAllServices({
      activeOnly: true,
      navbarOnly:
        ["true", "1"].includes(
          String(req.query?.navbar || "").toLowerCase()
        ),
    });

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
    const result = await getAllServices({
      activeOnly: false,
      navbarOnly: false,
    });

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
    const result = await createServiceRecord(req.body);

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
    const result = await updateServiceRecord(
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

export const updateStatus = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateServiceStatus(
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
    const result = await deleteService(req.params.id);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
