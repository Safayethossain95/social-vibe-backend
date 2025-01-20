const Post = require("../../models/PostModel");
const UserModel = require("../../models/UserModel");
const path = require("path");
const fs = require("fs"); // For handling file and directory paths
const fileUpload = require("express-fileupload"); 
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

const createPost = async (req, res) => {
  try {
    const { userId, subject, text } = req.body;

    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Create a new post
    const newPost = new Post({
      userId,
      subject,
      text,
    });

    // Save the new post to the database
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
};
const fetchOwnPosts = async (req, res) => {
  try {
    const { id } = req.params; // Extract userId from request parameters
    const matchedid = new mongoose.Types.ObjectId(id)
    
    const user = await UserModel.findById(matchedid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userPosts = await Post.find({ userId: matchedid });

    if (userPosts.length === 0) {
      return res.status(200).json({posts:[],user:user});
    }

    res.status(200).json({posts:userPosts,user:user});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
const fetchAllUsers = async (req, res) => {
  try {
    const { id } = req.params; 
    const users = await UserModel.find({ _id: { $ne: id } });

    if (!users) {
      return res.status(404).json({ message: "No user found" });
    }

   

    res.status(200).json({data:users});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
const pushFollower = async (req, res) => {
  try {
    const { id } = req.params; // ID of the user to add a follower to
    const { followerId } = req.body; // ID of the user who will follow

    if (!followerId) {
      return res.status(400).json({ message: "Follower ID is required" });
    }

    // Check if the follower exists
    const followerExists = await UserModel.findById(followerId);
    if (!followerExists) {
      return res.status(404).json({ message: "Follower user not found" });
    }

    // Add the follower to the user's followers array
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        $push: { following: { userId: followerId } },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Follower added successfully", user: updatedUser });
  } catch (error) {
    console.error("Error pushing follower:", error);
    res.status(500).json({ error: "Failed to add follower" });
  }
};

const fetchNewsFeed = async (req, res) => {
  try {
    const { id } = req.params; // Extract userId from request parameters
    const matchedId = new mongoose.Types.ObjectId(id);

    // Check if user exists
    const user = await UserModel.findById(matchedId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch posts
    const userPosts = await Post.find({});
    if (userPosts.length === 0) {
      return res.status(200).json({ posts: [], user });
    }

    // Enrich posts with user details
    const enrichedPosts = await Promise.all(
      userPosts.map(async (post) => {
        const postUser = await UserModel.findById(post.userId, "profilePicture fullname email");
        return {
          ...post._doc, // Spread post details
          profilePicture: postUser ? postUser.profilePicture : null,
          fullname: postUser ? postUser.fullname : null,
          email: postUser ? postUser.email : null,
        };
      })
    );

    res.status(200).json({ posts: enrichedPosts, user });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
const uploadImage = async (req, res) => {
  const { userId } = req.body; // Get userId from frontend
  const file = req.files?.image; // Get the uploaded image file

  console.log("Received userId:", userId);
  console.log("Received file:", file);

  if (!userId || !file) {
    return res.status(400).json({ message: "User ID and image are required" });
  }

  try {
    // Find the user by userId
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user already has a profile picture
    if (user.profilePicture) {
      // If the user already has an image, delete the old image
      const oldImagePath = path.join(__dirname, "../../uploads", user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete the old image
      }
    }

    // Define the path to save the new image
    const uploadPath = path.join(__dirname, "../../uploads", file.name);
    
    // Log to see the upload path
    console.log("Upload path:", uploadPath);

    // Save the new image to the 'uploads' folder
    await file.mv(uploadPath);

    // Update the user's profile picture in the database with the new image file name
    user.profilePicture = file.name; // Store the file name in the database
    await user.save();

    // Respond with the URL to access the image
    res.status(200).json({
      imageUrl: `/uploads/${file.name}`, // URL to access the image
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Server error", error });
  }
};






  module.exports = {
    fetchAllUsers,
    userGet,
    userPost,
    editUser,
    createPost,
    fetchOwnPosts,
    fetchNewsFeed,
    uploadImage,
    pushFollower
  };