import User from "../models/user.js";
import { auth as Authentication } from "../services/auth.js";
import bcrypt from "bcrypt";

/**
 * Manages the user authentication
 */
class AuthController {
  // Register User
  async register(req, res) {
    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Encrypting password
      const salt = await bcrypt.genSalt(10);
      const encPassword = await bcrypt.hash(password, salt);
      // Create and save the new user
      const newUser = new User({ username, email, password: encPassword });
      await newUser.save();

      return res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
      // TODO : Customize Data Validation Messages.
      res.status(500).json({ error: err.message });
    }
  }

  // Login user
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email, password" });
    }

    try {
      // Find user by email
      const user = await User.findOne({ email });
      /**
       * TODO : Match the fetched password with the user provided password.
       */
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      // generating user access token for communicating with API
      const sessionId = Authentication.generateAccessToken(user);
      res.cookie("session", sessionId);
      return res.status(200).json({ message: "Login successful!" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

const auth = new AuthController();
export default auth;