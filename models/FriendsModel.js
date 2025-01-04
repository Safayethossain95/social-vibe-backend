const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  friendname: {
    type: String,
    required: true,
  },
  imgurl: {
    type: String,
    required: true,
  },
  
  
});



const CartModel = mongoose.model("friends", ItemSchema);

module.exports = CartModel;
