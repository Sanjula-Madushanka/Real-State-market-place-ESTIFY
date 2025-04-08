// Routes/AuthRoutes.js
import express from "express";
import * as AuthController from "../Database/Controllers/AuthController.js"; // Adjusted path with .js extension

const router = express.Router();

// Register a new user
router.post("/register", AuthController.registerUser);

// Login a user
router.post("/login", AuthController.loginUser);

export default router;