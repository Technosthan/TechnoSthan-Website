import express from "express";
import enquiryRoutes from "../features/enquiries/enquiry.routes.js";

const router = express.Router();

router.use("/enquiries", enquiryRoutes);

export default router;
