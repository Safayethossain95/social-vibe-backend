const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../../models/UserModel"); // Adjust the path to your User model

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET, // Ensure you set this in your environment variables
      { expiresIn: "1d" } // Token expiration
    );
    res.cookie("token", token, {
        httpOnly: true, // Ensures the cookie is not accessible via JavaScript
        secure: process.env.NODE_ENV === "production" ? true : false, // Use secure cookies in production
        sameSite: "none", // Prevents CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // Cookie expiration (1 day)
      });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong during login" });
  }
};
const signupController = async (req, res) => {
    try {
      const { email, password, fullname } = req.body;
  
      // Check if the email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new UserModel({
        email,
        password: hashedPassword,
        fullname,
      });
  
      // Save the new user to the database
      const savedUser = await newUser.save();
  
      res.status(201).json({
        message: "Signup successful",
        user: {
          id: savedUser._id,
          email: savedUser.email,
          fullname: savedUser.fullname,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to register user" });
    }
  };
  

module.exports = {loginController,signupController};
