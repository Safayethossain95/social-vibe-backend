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
});

const TabSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  items: {
    type: [ItemSchema],
    required: false,
  },
});

const FoodModel = mongoose.model("foods", TabSchema);

module.exports = FoodModel;
