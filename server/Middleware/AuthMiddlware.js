import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;

export const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token", success: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    req.user = user; // or just decoded if you prefer
    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid token", success: false });
  }
};
