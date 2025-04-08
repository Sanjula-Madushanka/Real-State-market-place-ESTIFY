// Routes/InquiryRoutes.js
import express from "express";
import * as InquiryController from "../Database/Controllers/InquiryController.js"; // Adjusted path with .js extension
import authenticate from "../middleware/authenticate.js"; // Adjusted path with .js extension
import isAdmin from "../middleware/isAdmin.js"; // Adjusted path with .js extension

const router = express.Router();

// Submit an inquiry (logged-in users only)
router.post("/", authenticate, InquiryController.submitInquiry);

// Respond to an inquiry (admin only)
router.put("/:id/respond", authenticate, isAdmin, InquiryController.respondToInquiry);

// Get all inquiries for a user (logged-in users only)
router.get("/", authenticate, InquiryController.getUserInquiries);

// Get all inquiries (admin only)
router.get("/all", authenticate, isAdmin, InquiryController.getAllInquiries);

export default router;