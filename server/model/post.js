import mongoose from "mongoose";

const PostSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    // Remove unique constraint or make it case-sensitive
    // unique: true
  },
  description: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
  },
  categories: {
    type: String, // Keeping for backward compatibility
    required: false,
  },
  tags: {
    type: [String], // Array of strings for multiple tags
    default: [],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  upvotes: [
    {
      type: String, // Store usernames of users who upvoted
      required: true,
    },
  ],
  downvotes: [
    {
      type: String, // Store usernames of users who downvoted
      required: true,
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
});

// Create a compound index for title and username to allow same titles for different users
PostSchema.index({ title: 1, username: 1 }, { unique: true });

const post = mongoose.model("post", PostSchema);

export default post;
