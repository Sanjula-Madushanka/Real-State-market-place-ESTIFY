import express from "express";
import {
  loginAgent,
  registerAgent,
  getAgentById,
  getAllAgents
} from "../Database/Controllers/AgentController.js";

const router = express.Router();

router.post("/register", registerAgent);
router.post("/login", loginAgent);
router.get("/:id", getAgentById);
router.get("/", getAllAgents); // ✅ Added route to fetch all agents

export default router;
