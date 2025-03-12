import mongoose from "mongoose";

const CommentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  comments: {
    type: String,
    required: true,
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

const comment = mongoose.model("comment", CommentSchema);

export default comment;
