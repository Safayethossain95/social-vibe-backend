const UserModel = require("../../models/UserModel");

const userPost = async (req, res) => {
    try {
      const { id,
        label,
        items } = req.body;
  
      // Create a new cart document
      const newcart = new UserModel({
        id,
        label,
        items  // default to true if not provided
      });
  
      const savedCart = await newcart.save();
      res.status(201).json(savedCart);
    } catch (error) {
      res.status(500).json({ error: "Failed to create cart" });
    }
  };

  module.exports = {
    userPost
  };