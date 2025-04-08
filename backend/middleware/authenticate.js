// middleware/authenticate.js
import { verifyToken } from "../utils/jwt.js";

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = verifyToken(token);
    
    // Ensure structure matches what's expected downstream
    req.user = {
      userId: decoded.id,
      role: decoded.role
    };

    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export default authenticate;
