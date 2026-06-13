import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "Database Connected"
  });
});

export default router;