import {
  createHeroFeature,
  deleteHeroFeature,
  getAdminHeroVisual,
  getPublicHeroVisual,
  listHeroFeatures,
  updateHeroFeature,
  updateHeroFeatureStatus,
  upsertHeroVisualSetting,
} from "./heroVisual.service.js";

export const getPublic = async (
  req,
  res,
  next
) => {
  try {
    const result = await getPublicHeroVisual();
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
    const [setting, features] = await Promise.all([
      getAdminHeroVisual(),
      listHeroFeatures(),
    ]);

    res.json({
      success: true,
      data: {
        setting,
        features,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saveSetting = async (
  req,
  res,
  next
) => {
  try {
    const result = await upsertHeroVisualSetting(
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

export const createFeature = async (
  req,
  res,
  next
) => {
  try {
    const result = await createHeroFeature(
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

export const updateFeature = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateHeroFeature(
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

export const updateFeatureStatus = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateHeroFeatureStatus(
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

export const removeFeature = async (
  req,
  res,
  next
) => {
  try {
    await deleteHeroFeature(req.params.id);

    res.json({
      success: true,
      message: "Hero feature deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
