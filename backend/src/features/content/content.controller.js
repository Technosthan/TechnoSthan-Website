import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent
} from "./content.service.js";

export const create = async (req, res) => {
  try {
    const content = await createContent(req.body, req.user._id);

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAll = async (req, res) => {
  const data = await getAllContent();

  res.json({
    success: true,
    data
  });
};

export const getOne = async (req, res) => {
  const data = await getContentById(req.params.id);

  res.json({
    success: true,
    data
  });
};

export const update = async (req, res) => {
  const data = await updateContent(req.params.id, req.body);

  res.json({
    success: true,
    data
  });
};

export const remove = async (req, res) => {
  await deleteContent(req.params.id);

  res.json({
    success: true,
    message: "Deleted successfully"
  });
};