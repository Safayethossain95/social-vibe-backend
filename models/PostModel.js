const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Reference to the User model
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
