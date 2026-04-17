import {
  addData,
  getData,
  getLatest,
  updateData,
  removeData,
} from "./iot.service.js";

export const create = async (req, res) => {
  try {
    const data = await addData(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAll = async (req, res) => {
  const data = await getData(req.query);

  res.json({
    success: true,
    data,
  });
};

export const latest = async (req, res) => {
  const data = await getLatest();

  res.json({
    success: true,
    data,
  });
};

export const update = async (req, res) => {
  try {
    const data = await updateData(req.params.id, req.body);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    await removeData(req.params.id);

    res.json({
      success: true,
      message: "Data removed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
