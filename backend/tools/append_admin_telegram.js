const fs = require('fs');
const p = 'backend/src/features/admin/admin.controller.js';
let c = fs.readFileSync(p, 'utf8');
if (c.includes('// ===== ADMIN TELEGRAM LINKING')) {
  console.log('already present');
  process.exit(0);
}
const add = `// ===== ADMIN TELEGRAM LINKING (admin self-linking) =====
import { generateLinkingCode, unlinkTelegramAccount } from "../auth/telegramLinking.service.js";
import { getTelegramRuntimeSettings } from "./authSettings.service.js";

export const generateAdminTelegramProfileLinkingCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) { return res.status(404).json({ success: false, message: "User not found" }); }
    if (!user.mobile) { return res.status(400).json({ success: false, message: "Add and verify your phone number before linking Telegram" }); }
    if (!user.phoneVerified) { return res.status(400).json({ success: false, message: "Verify your phone number before linking Telegram" }); }
    const code = await generateLinkingCode(user.mobile);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const telegramSettings = await getTelegramRuntimeSettings();
    user.telegramLinkCode = code; user.telegramLinkCodeExpires = expiresAt; await user.save();
    res.json({ success: true, message: "Telegram linking code generated successfully", data: { code, expiresIn: "15 minutes", botLink: telegramSettings.botUsername ? `https://t.me/${telegramSettings.botUsername.replace(/^@/, "")}` : null } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAdminTelegramStatus = async (req, res) => {
  try { const user = await User.findById(req.user.id); if (!user) return res.status(404).json({ success: false, message: "User not found" }); res.json({ success: true, data: { telegramLinked: !!user.telegramLinked, telegramUsername: user.telegramUsername, telegramChatId: user.telegramChatId, telegramLinkCode: user.telegramLinkCode, telegramLinkCodeExpires: user.telegramLinkCodeExpires } }); } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const unlinkAdminTelegramProfile = async (req, res) => {
  try { const user = await User.findById(req.user.id); if (!user) return res.status(404).json({ success: false, message: "User not found" }); await unlinkTelegramAccount(user.mobile); user.telegramLinkCode = null; user.telegramLinkCodeExpires = null; await user.save(); res.json({ success: true, message: "Telegram unlinked successfully" }); } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};
`;

c = add + '\n' + c;
fs.writeFileSync(p, c, 'utf8');
console.log('appended admin telegram functions');
