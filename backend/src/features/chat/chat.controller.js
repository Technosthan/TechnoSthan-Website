import { getAIResponse } from "./ai.service.js";
import Chat from "./chat.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import * as pdfParse from "pdf-parse";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  },
});

// Helper function to extract text from files
const extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (mimeType.startsWith("text/")) {
      const content = await promisify(fs.readFile)(filePath, "utf8");
      return content;
    } else if (mimeType === "application/pdf") {
      const dataBuffer = await promisify(fs.readFile)(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimeType.startsWith("image/")) {
      // For images, we'll use AI to describe them
      return "This is an image file. AI vision analysis would be implemented here to describe the image content.";
    } else {
      return `This is a ${mimeType} file. Content analysis would be implemented based on file type.`;
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return "Error reading file content.";
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user?.id;
    const { message } = req.body;

    // Validation: Require message when file is uploaded
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required when uploading file",
      });
    }

    const file = req.file;

    // Extract text/content from the uploaded file
    const fileContent = await extractTextFromFile(file.path, file.mimetype);

    // Create a comprehensive prompt for AI analysis
    const analysisPrompt = `
Please analyze this uploaded file and provide insights:

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

    // Get AI response
    const aiResponse = await getAIResponse(analysisPrompt, []);

    // Save to database for authenticated users only
    if (userId) {
      const chatEntry = new Chat({
        userId,
        message: `File uploaded: ${file.originalname} - ${message || "Please analyze this file"}`,
        response: aiResponse,
        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        },
      });

      await chatEntry.save();
    }

    // Clean up uploaded file after processing
    try {
      await promisify(fs.unlink)(file.path);
    } catch (cleanupError) {
      console.warn("Failed to clean up uploaded file:", cleanupError);
    }

    res.json({
      success: true,
      data: {
        reply: aiResponse,
        file: {
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
        },
      },
    });
  } catch (error) {
    console.error("File upload error:", error);

    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        await promisify(fs.unlink)(req.file.path);
      } catch (cleanupError) {
        console.warn("Failed to clean up file after error:", cleanupError);
      }
    }

    let statusCode = 500;
    let errorMessage = "Failed to process uploaded file";

    if (error.message.includes("File too large")) {
      statusCode = 413;
      errorMessage = "File is too large. Maximum size is 10MB.";
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

export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user?.id;

    // Validation: Check if message is provided
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a non-empty string",
      });
    }

    const reply = await getAIResponse(message.trim(), history);

    // Save chat to database for authenticated users only
    if (userId) {
      const chatEntry = new Chat({
        userId,
        message: message.trim(),
        response: reply,
      });

      await chatEntry.save();
    }

    res.json({
      success: true,
      reply: reply,
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    // Handle specific error messages from service
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
    const userId = req.user.id;

    const chats = await Chat.find({ userId }).sort({ createdAt: -1 }).limit(50); // Limit to last 50 chats

    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};

export { upload };
