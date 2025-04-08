// UserController.js
import User from "../../Models/UserModel.js"; // Adjusted path to match ES Modules and your model folder
import { generateToken } from "../../utils/jwt.js"; // Adjusted path with .js extension

// Register a new user
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = new User({ username, email, password });
        await user.save();

        // Generate a JWT for the new user
        const token = generateToken(user._id, user.role);

        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        res.status(400).json({ message: "Error registering user", error: err.message });
    }
};

// Login a user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate a JWT for the logged-in user
        const token = generateToken(user._id, user.role);

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        res.status(400).json({ message: "Error logging in", error: err.message });
    }
};