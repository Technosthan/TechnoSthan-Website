// Add this to the end of auth.controller.js

// ================= GENERATE TELEGRAM LINKING CODE =================
export const generateTelegramLinkingCodeController = async (req, res) => {
  try {
    const code = await generateLinkingCode();
    res.json({
      success: true,
      message: "Linking code generated successfully",
      data: {
        code,
        expiresIn: "15 minutes",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY AND LINK TELEGRAM ACCOUNT =================
export const verifyAndLinkTelegramController = async (req, res) => {
  try {
    const { chatId, code, phoneNumber } = req.body;

    if (!chatId || !code || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Chat ID, code, and phone number are required",
      });
    }

    const result = await verifyAndLinkAccount(chatId, code, phoneNumber);

    res.json({
      success: true,
      message: result.message,
      data: result.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
