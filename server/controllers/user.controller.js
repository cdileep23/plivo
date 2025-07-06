import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()
console.log(process.env.JWT_SECRET);
const JWT_SECRET = process.env.JWT_SECRET ;
const COOKIE_NAME = "token";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required", success:false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User already exists", success: false });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: newUser._id, role:newUser.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 2 * 24 * 60 * 60 * 1000, 
      })
      .status(201)
      .json({
        message: "User created successfully",
        success:true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password required", success: false });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res
      .status(401)
      .json({ message: "Invalid credentials", success: false });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 2 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        success:true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


export const logout = (req, res) => {
  res
    .clearCookie(COOKIE_NAME)
    .status(200)
    .json({ message: "Logout successful", success: true});
};


export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    res.status(200).json({ success: true,message:"User Details Fecthed SuccessFully", user:user});
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
