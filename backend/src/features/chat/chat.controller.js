import { getAIResponse } from "./ai.service.js";
import Chat from "./chat.model.js";
import Conversation from "./conversation.model.js";
import * as pdfParse from "pdf-parse";
import {
  deleteCloudinaryAsset,
  createMemoryUpload,
  getCloudinaryFolder,
  getCloudinaryResourceType,
  uploadBufferToCloudinary,
} from "../../shared/services/cloudinary.service.js";

// Configure multer for file uploads
const upload = createMemoryUpload({
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
});

// Helper function to extract text from files
const extractTextFromBuffer = async (buffer, mimeType) => {
  try {
    if (mimeType.startsWith("text/")) {
      return Buffer.from(buffer).toString("utf8");
    } else if (mimeType === "application/pdf") {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (mimeType.startsWith("image/")) {
      return "This is an image file. AI vision analysis would be implemented here to describe the image content.";
    } else {
      return `This is a ${mimeType} file. Content analysis would be implemented based on file type.`;
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return "Error reading file content.";
  }
};

const createOrGetConversation = async ({
  userId,
  conversationId,
  title,
  firstMessage,
}) => {
  if (conversationId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });
    if (conversation) {
      return conversation;
    }
  }

  const conversationTitle = title || firstMessage?.slice(0, 40) || "New Chat";
  return Conversation.create({ userId, title: conversationTitle });
};

export const uploadFile = async (req, res) => {
  let uploadedAsset = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user?.id;
    const { message, conversationId, title } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required when uploading file",
      });
    }

    const file = req.file;
    const fileContent = await extractTextFromBuffer(file.buffer, file.mimetype);
    const resourceType = getCloudinaryResourceType(file);
    const folder = getCloudinaryFolder("chat");
    uploadedAsset = await uploadBufferToCloudinary({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder,
      resourceType,
    });

    const analysisPrompt = `Please analyze this uploaded file and provide insights:

File Name: ${file.originalname}
File Type: ${file.mimetype}
File Size: ${file.size} bytes

File Content:
${fileContent}

${message || "Please provide a comprehensive analysis of this file, including any relevant insights, recommendations, or observations."}

Please structure your response to include:
1. File summary
2. Key findings or insights
3. Any recommendations or observations
4. Agricultural relevance (if applicable)
`;

    const aiResponse = await getAIResponse(analysisPrompt, []);

    if (userId) {
      const conversation = await createOrGetConversation({
        userId,
        conversationId,
        title,
        firstMessage: `File uploaded: ${file.originalname}`,
      });

      const chatEntry = new Chat({
        userId,
        conversationId: conversation._id,
        message: `File uploaded: ${file.originalname} - ${message}`,
        response: aiResponse,
      file: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: uploadedAsset.secureUrl,
        asset: uploadedAsset,
      },
    });

      await chatEntry.save();
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    res.json({
      success: true,
      data: {
        reply: aiResponse,
        file: {
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
          url: uploadedAsset.secureUrl,
          publicId: uploadedAsset.publicId,
          resourceType: uploadedAsset.resourceType,
        },
      },
    });
  } catch (error) {
    if (uploadedAsset?.publicId) {
      await deleteCloudinaryAsset(
        uploadedAsset.publicId,
        uploadedAsset.resourceType || "raw",
      ).catch((cleanupError) => {
        console.warn(
          "[chat.uploadFile] Failed to delete uploaded asset after error:",
          cleanupError.message,
        );
      });
    }

    console.error("File upload error:", error);

    let statusCode = 500;
    let errorMessage = "Failed to process uploaded file";

    if (error.message.includes("File too large")) {
      statusCode = 413;
      errorMessage = "File is too large. Maximum size is 10MB.";
    } else if (error.statusCode === 503) {
      statusCode = 503;
      errorMessage = "Upload service is not configured";
    } else if (error.message.includes("not allowed")) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes("API")) {
      statusCode = 503;
      errorMessage = "AI service temporarily unavailable";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const createConversation = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { title } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversation = await Conversation.create({
      userId,
      title: title?.trim() || "New Chat",
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message,
    });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Chat.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load conversation messages",
      error: error.message,
    });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    await Chat.deleteMany({ conversationId: conversation._id });
    await conversation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
      error: error.message,
    });
  }
};

export const chat = async (req, res) => {
  try {
    const { message, history, conversationId, title } = req.body;
    const userId = req.user?.id;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a non-empty string",
      });
    }

    const reply = await getAIResponse(message.trim(), history);
    let responsePayload = { success: true, reply };

    if (userId) {
      const conversation = await createOrGetConversation({
        userId,
        conversationId,
        title,
        firstMessage: message.trim(),
      });

      const chatEntry = new Chat({
        userId,
        conversationId: conversation._id,
        message: message.trim(),
        response: reply,
      });
      await chatEntry.save();

      conversation.updatedAt = new Date();
      await conversation.save();

      responsePayload.conversationId = conversation._id;
    }

    res.json(responsePayload);
  } catch (error) {
    console.error("Chat controller error:", error);
    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (error.message.includes("API access forbidden")) {
      statusCode = 403;
      errorMessage = error.message;
    } else if (error.message.includes("API quota exceeded")) {
      statusCode = 429;
      errorMessage = error.message;
    } else if (
      error.message.includes("Internal server error from Google Cloud API")
    ) {
      statusCode = 500;
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

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    const conversationIds = conversations.map(
      (conversation) => conversation._id,
    );
    const chats = await Chat.find({ conversationId: { $in: conversationIds } })
      .sort({ createdAt: 1 })
      .lean();

    const latestMap = {};
    chats.forEach((entry) => {
      const key = entry.conversationId.toString();
      latestMap[key] = entry;
    });

    const historyData = conversations.map((conversation) => ({
      id: conversation._id,
      title: conversation.title || "New Chat",
      updatedAt: conversation.updatedAt,
      preview:
        latestMap[conversation._id.toString()]?.response ||
        latestMap[conversation._id.toString()]?.message ||
        "New conversation",
    }));

    res.status(200).json({
      success: true,
      data: historyData,
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};

export { upload };
