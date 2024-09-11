import User from "../models/user.js";

// Register user
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create and save the new user
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    // TODO : Customize Data Validation Messages.
    res.status(500).json({ error: err.message });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
