const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  foodname: {
    type: String,
    required: true,
  },
  imgurl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: false,
  },
});

const CartModel = mongoose.model("carts", ItemSchema);

module.exports = CartModel;
