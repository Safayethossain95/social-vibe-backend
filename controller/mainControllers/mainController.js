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
      const myId = new mongoose.Types.ObjectId(id)// Extract the user ID from the request parameters
  
      // Fetch the requesting user's data to access the following array
      const requestingUser = await UserModel.findById(myId);
      if (!requestingUser) {
        return res.status(404).json({ message: "Requesting user not found" });
      }
  
      // Extract IDs from the following array
      const excludedIds = requestingUser.following.map(f => f.userId);
  
      // Fetch all users excluding the requesting user and the users in the following array
      const users = await UserModel.find({
        _id: { $nin: [myId, ...excludedIds] }, // Exclude both the requesting user and the followed users
      });
  
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
  
      res.status(200).json({ data: users });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
}
const pushFollower = async (req, res) => {
  try {
    const { meid, id } = req.params; // `meid` is the user who follows, `id` is the user being followed
  
    if (!meid || !id) {
      return res.status(400).json({ message: "Both user ID and follower ID are required" });
    }
  
    // Check if both users exist
    const [userExists, targetUserExists] = await Promise.all([
      UserModel.findById(meid),
      UserModel.findById(id),
    ]);
  
    if (!userExists || !targetUserExists) {
      return res.status(404).json({ message: "One or both users not found" });
    }
  
    // Update both `following` and `followers` arrays simultaneously
    const [updatedUser, updatedUser2] = await Promise.all([
      UserModel.findOneAndUpdate(
        { _id: meid, "following.userId": { $ne: id } }, // Ensure `id` is not already in `following`
        { $push: { following: { userId: id } } },
        { new: true }
      ),
      UserModel.findOneAndUpdate(
        { _id: id, "followers.userId": { $ne: meid } }, // Ensure `meid` is not already in `followers`
        { $push: { followers: { userId: meid } } },
        { new: true }
      ),
    ]);
  
    if (!updatedUser || !updatedUser2) {
      return res.status(404).json({ message: "One or both updates failed" });
    }
  
    res.status(200).json({
      message: "Users updated successfully",
      userFollowing: updatedUser,
      userFollowed: updatedUser2,
    });
  } catch (error) {
    console.error("Error updating users:", error);
    res.status(500).json({ error: "Failed to update users" });
  }
  
};
const getFollowersById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the user ID from the request parameters
  
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    // Fetch the user by ID to get the followers array
    const user = await UserModel.findById(id).select("followers");
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Extract all userIds from the followers array
    const userIds = user.followers.map((follower) => follower.userId);
  
    // Fetch details of all users whose IDs are in userIds
    const followersDetails = await UserModel.find(
      { _id: { $in: userIds } }
    );
  
    res.status(200).json({
      message: "Followers fetched successfully",
      followers: followersDetails,
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
  
  
};
const getFollowingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    // Fetch the user and populate the 'following' field with all details
    const user = await UserModel.findById(id).populate("following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userIds = user.following.map((followingsingle) => followingsingle.userId);
  
    // Fetch details of all users whose IDs are in userIds
    const followersDetails = await UserModel.find(
      { _id: { $in: userIds } }
    );
    res.status(200).json({
      message: "Following fetched successfully",
      following: followersDetails, // Contains full details of each followed user
    });
  } catch (error) {
    console.error(`Error fetching following for user ${id}:`, error.message);
    res.status(500).json({ error: "Failed to fetch following" });
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
    pushFollower,
    getFollowersById,
    getFollowingById
  };