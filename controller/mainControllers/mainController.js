const UserModel = require("../../models/UserModel");

const mongoose = require('mongoose');

const userGet = async (req, res) => {
  try {
    const { id } = req.params; 

    const userId = new mongoose.Types.ObjectId(id);

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch user" });
  }
};

const userPost = async (req, res) => {
  try {
    const { 
      email,
      password,
      fullname,
      profilePicture,
      coverPicture,
      followers,
      following,
      isAdmin,
      desc,
      relationship
    } = req.body;

    // Check if the email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    // Create a new user document
    const newUser = new UserModel({
      email,
      password,
      fullname,
      profilePicture,
      coverPicture,
      followers, 
      following,
      isAdmin,
      desc,
      relationship
    });

    // Save the new user to the database
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};


const editUser = async (req, res) => {
  try {
    const { id, email, password, fullname, profilePicture, coverPicture, followers, following, isAdmin, desc, relationship } = req.body;

    // Convert the id to an ObjectId
    const userId = new mongoose.Types.ObjectId(id);

    // Check if user with given ID exists
    const existingUser = await UserModel.findById(userId);
    
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user exists, proceed to update
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        email,
        password,
        fullname,
        profilePicture,
        coverPicture,
        followers,
        following,
        isAdmin,
        desc,
        relationship
      },
      { new: true, runValidators: true } // Ensure validation is triggered
    );

    // Return the updated user
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update user" });
  }
};



  module.exports = {
    userGet,
    userPost,
    editUser
  };