const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    
    email: {
    type: String,
    required: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    followers: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
          }
        },
      ],
      default: [],
    },
    following: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
          }
        },
      ],
      default: [],
    },
    desc: {
      type: String
    },
    relationship: {
      type: String,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
