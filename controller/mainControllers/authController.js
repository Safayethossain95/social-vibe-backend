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
      process.env.JWT_SECRET, // Ensure this is set in your environment variables
      { expiresIn: "1d" } // Token expiration
    );
    
    const cookieOptions = {
      httpOnly: true, // Secure the cookie (not accessible via JavaScript)
      secure: false, // Set to `true` in production if using HTTPS
      expires: new Date(Date.now() + 30 * 60 * 1000), // Cookie expiration (30 minutes)
    };
    
    res.cookie('token', token, cookieOptions); 
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
const authController = async (req, res) => {
  const token = req.cookies.token;
  console.log(token) // Access the 'token' cookie
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' }); // No token, return Unauthorized
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' }); // Invalid token
    }
    
    // Token is valid, proceed with user data
    res.status(200).json({ message: 'User authenticated', user: decoded });
  });
  };
const logoutController = async (req, res) => {
    try {
      res.clearCookie('token', { path: '/' }); // Clear the cookie
      res.status(200).json({data:true,message:"Logout successful"});
    } catch (error) {
      res.status(500).json({ error: "Failed to logout" });
    }
  };
  

module.exports = {loginController,signupController,authController,logoutController};
