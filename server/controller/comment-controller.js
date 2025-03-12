import Comment from "../model/comment.js";

export const newComment = async (request, response) => {
  try {
    const comment = await new Comment(request.body);
    comment.save();

    response.status(200).json("Comment saved successfully");
  } catch (error) {
    response.status(500).json(error);
  }
};

export const getComments = async (request, response) => {
  try {
    const comments = await Comment.find({ postId: request.params.id });

    response.status(200).json(comments);
  } catch (error) {
    response.status(500).json(error);
  }
};

export const deleteComment = async (request, response) => {
  try {
    console.log("Delete comment request params:", request.params);

    if (!request.params.id) {
      return response.status(400).json({
        msg: "Comment ID is required",
        isSuccess: false,
      });
    }

    // Validate if ID is a valid MongoDB ObjectId
    if (!request.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return response.status(400).json({
        msg: "Invalid comment ID format",
        isSuccess: false,
      });
    }

    const comment = await Comment.findById(request.params.id);
    console.log("Found comment:", comment);

    if (!comment) {
      return response.status(404).json({
        msg: "Comment not found",
        isSuccess: false,
      });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(request.params.id);
    console.log("Comment deleted successfully");

    return response.status(200).json({
      msg: "Comment deleted successfully",
      isSuccess: true,
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return response.status(500).json({
      msg: "Error deleting comment: " + error.message,
      isSuccess: false,
      error: error.message,
    });
  }
};

export const voteComment = async (request, response) => {
  try {
    const { id } = request.params;
    const { username, voteType } = request.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return response
        .status(404)
        .json({ msg: "Comment not found", isSuccess: false });
    }

    // Initialize arrays if they don't exist
    if (!comment.upvotes) comment.upvotes = [];
    if (!comment.downvotes) comment.downvotes = [];

    // Check if user has already voted
    const hasUpvoted = comment.upvotes.includes(username);
    const hasDownvoted = comment.downvotes.includes(username);

    // Remove any existing votes by this user
    comment.upvotes = comment.upvotes.filter((voter) => voter !== username);
    comment.downvotes = comment.downvotes.filter((voter) => voter !== username);

    // Apply new vote if it's different from the previous one
    if (voteType === "upvote" && !hasUpvoted) {
      comment.upvotes.push(username);
    } else if (voteType === "downvote" && !hasDownvoted) {
      comment.downvotes.push(username);
    }

    // Update score
    comment.score = comment.upvotes.length - comment.downvotes.length;

    await comment.save();

    response.status(200).json({
      msg: "Vote updated successfully",
      isSuccess: true,
      comment: {
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        score: comment.score,
      },
    });
  } catch (error) {
    console.error("Vote comment error:", error);
    response.status(500).json({
      msg: error.message || "Error updating vote",
      isSuccess: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }
};
