import Agent from "../../Models/AgentModel.js";
import { generateToken } from "../../utils/jwt.js";

export const registerAgent = async (req, res) => {
  const { name, email, password, phone, agencyName } = req.body;
  try {
    const existing = await Agent.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const agent = new Agent({ name, email, password, phone, agencyName });
    await agent.save();

    const token = generateToken(agent._id, "agent");
    res.status(201).json({ message: "Agent registered successfully", token, agent });
  } catch (err) {
    res.status(500).json({ message: "Agent registration failed", error: err.message });
  }
};

export const loginAgent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });
    if (!agent) return res.status(401).json({ message: "Invalid credentials" });

    const match = await agent.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(agent._id, "agent");
    res.status(200).json({ message: "Login successful", token, agent });
  } catch (err) {
    res.status(500).json({ message: "Agent login failed", error: err.message });
  }
};

export const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select("-password");
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json(agent);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch agent", error: err.message });
  }
};

export const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select("_id email name");
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch agents", error: err.message });
  }
};
