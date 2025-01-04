

const CartModel = require("../../models/CartModel");
const FoodModel = require("../../models/FoodModel");

const cartGet = async (req, res) => {
  try {
    const data = await CartModel.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve carts" });
  }
};
const foodGet = async (req, res) => {
  try {
    const data = await FoodModel.find({});
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve carts" });
  }
};
const foodPost = async (req, res) => {
  try {
    const { id,
      label,
      items } = req.body;

    // Create a new cart document
    const newcart = new FoodModel({
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
const cartPost = async (req, res) => {
  try {
    const { foodname, imgurl, price, unit, quantity } = req.body;

    // Find the existing cart for the given id
    let existingCart = await CartModel.findOne({ foodname });

    if (!existingCart) {
      // If the cart doesn't exist, create a new cart entry with the provided item
      const newCart = new CartModel({
        
        foodname,
        imgurl,
        price,
        unit,
        quantity,
      });

      const savedCart = await newCart.save();
      res.status(201).json(savedCart);
    } else {
      // If the cart exists, increment the quantity of the existing item
      existingCart.quantity += quantity;

      // Save the updated cart
      const updatedCart = await existingCart.save();
      res.status(200).json(updatedCart);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create or update cart" });
  }
};
const cartDecrement = async (req, res) => {
  try {
    const { foodname, quantity } = req.body;

    // Validate that quantity is a positive number
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    // Find the existing cart for the given foodname
    let existingCart = await CartModel.findOne({ foodname });

    if (!existingCart) {
      // If the cart doesn't exist, send a response indicating that
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // Decrease the quantity in the cart if it is greater than 1
    if (existingCart.quantity > quantity) {
      existingCart.quantity -= quantity;

      // Save the updated cart
      const updatedCart = await existingCart.save();
      return res.status(200).json(updatedCart);
    } 
    // If the quantity is 1 or less, remove the item from the cart
    else if (existingCart.quantity === 1) {
      // Remove the item from the cart
      await CartModel.deleteOne({ foodname });

      return res.status(200).json({ message: "Item removed from cart" });
    } 
    // In case the quantity is less than 1, it's an invalid state
    else {
      return res.status(400).json({ error: "Invalid quantity" });
    }

  } catch (error) {
    // Log the error and send a response
    console.error(error);
    res.status(500).json({ error: "Failed to decrement cart item" });
  }
};




const cartEdit = async (req, res) => {
  const { id } = req.params;
  const { isActive, img } = req.body;

  try {
    // Find the banner by ID and update its fields
    const updatedBanner = await CartModel.findByIdAndUpdate(
      id,
      { isActive, img },
      { new: true } // Return the updated document
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ data: updatedBanner });
  } catch (err) {
    console.error("Error updating banner:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const cartDelete = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the banner by ID and delete it
    const deleted = await CartModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  cartGet,
cartPost,
cartEdit,
cartDelete,
foodPost,
foodGet,
cartDecrement
};
