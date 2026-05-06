import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
} from "./content.service.js";
import { summarizeContent } from "../chat/ai.service.js";

export const create = async (req, res) => {
  try {
    const content = await createContent(req.body, req.user._id);

    res.status(201).json({
      success: true,
      data: content,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAll = async (req, res) => {
  const data = await getAllContent();

  res.json({
    success: true,
    data,
  });
};

export const getOne = async (req, res) => {
  const data = await getContentById(req.params.id);

  res.json({
    success: true,
    data,
  });
};

export const update = async (req, res) => {
  const data = await updateContent(req.params.id, req.body);

  res.json({
    success: true,
    data,
  });
};

export const remove = async (req, res) => {
  await deleteContent(req.params.id);

  res.json({
    success: true,
    message: "Deleted successfully",
  });
};

export const summarize = async (req, res) => {
  try {
    const { content } = req.body;

    // Validation
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Content is required and must be a non-empty string",
      });
    }

    const summary = await summarizeContent(content.trim());

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Summarize controller error:", error);

    // Handle specific error messages from service
    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (error.message.includes("API access forbidden")) {
      statusCode = 403;
      errorMessage = error.message;
    } else if (error.message.includes("API quota exceeded")) {
      statusCode = 429;
      errorMessage = error.message;
    } else {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};
