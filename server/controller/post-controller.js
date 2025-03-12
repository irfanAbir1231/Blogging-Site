import Post from "../model/post.js";

export const createPost = async (request, response) => {
  try {
    console.log("Received post data:", request.body);

    // Ensure picture is a string
    const postData = {
      ...request.body,
      picture:
        request.body.picture && typeof request.body.picture === "object"
          ? request.body.picture.data
          : request.body.picture,
    };

    const post = await new Post(postData);
    await post.save();

    response.status(200).json({
      msg: "Post saved successfully",
      isSuccess: true,
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return response.status(400).json({
        msg: "A post with this title already exists. Please choose a different title.",
        isSuccess: false,
        field: "title",
        error: {
          code: error.code,
          keyPattern: error.keyPattern,
        },
      });
    }

    response.status(500).json({
      msg: error.message || "Error creating post",
      isSuccess: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }
};

export const updatePost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (!post) {
      response.status(404).json({ msg: "Post not found" });
    }

    await Post.findByIdAndUpdate(request.params.id, { $set: request.body });

    response.status(200).json("post updated successfully");
  } catch (error) {
    response.status(500).json(error);
  }
};

export const deletePost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    await post.delete();

    response.status(200).json("post deleted successfully");
  } catch (error) {
    response.status(500).json(error);
  }
};

export const getPost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    response.status(200).json(post);
  } catch (error) {
    response.status(500).json(error);
  }
};

export const getAllPosts = async (request, response) => {
  let username = request.query.username;
  let category = request.query.category;
  let page = parseInt(request.query.page) || 1;
  let limit = parseInt(request.query.limit) || 10;
  let posts;
  try {
    const query = {};
    if (username) query.username = username;
    if (category) query.categories = category;

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    // Get posts with pagination and sorting
    posts = await Post.find(query)
      .sort({ createdDate: -1 }) // Sort by newest first
      .skip((page - 1) * limit)
      .limit(limit);

    response.status(200).json({
      data: posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    response.status(500).json(error);
  }
};

export const votePost = async (request, response) => {
  try {
    const { id } = request.params;
    const { username, voteType } = request.body;

    const post = await Post.findById(id);
    if (!post) {
      return response
        .status(404)
        .json({ msg: "Post not found", isSuccess: false });
    }

    // Check if user has already voted
    const hasUpvoted = post.upvotes.includes(username);
    const hasDownvoted = post.downvotes.includes(username);

    // Remove any existing votes by this user
    post.upvotes = post.upvotes.filter((voter) => voter !== username);
    post.downvotes = post.downvotes.filter((voter) => voter !== username);

    // Apply new vote only if it's different from the previous one
    // If clicking the same button, it will act as an unvote
    if (voteType === "upvote" && !hasUpvoted) {
      post.upvotes.push(username);
    } else if (voteType === "downvote" && !hasDownvoted) {
      post.downvotes.push(username);
    }
    // If clicking the same button again, the vote is removed (unvote)

    // Update score
    post.score = post.upvotes.length - post.downvotes.length;

    await post.save();

    // Return the complete updated post
    response.status(200).json({
      msg:
        hasUpvoted || hasDownvoted
          ? "Vote removed successfully"
          : "Vote updated successfully",
      isSuccess: true,
      data: {
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        score: post.score,
        _id: post._id,
        title: post.title,
        description: post.description,
        picture: post.picture,
        username: post.username,
        categories: post.categories,
        createdDate: post.createdDate,
      },
    });
  } catch (error) {
    console.error("Vote post error:", error);
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

export const searchPosts = async (request, response) => {
  try {
    const { query } = request.query;
    if (!query) {
      return response.status(400).json({
        msg: "Search query is required",
        isSuccess: false,
      });
    }

    // Create a case-insensitive regex for the search query
    const searchRegex = new RegExp(query, "i");

    // Search in title, description, and username
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { username: { $regex: searchRegex } },
        { categories: { $regex: searchRegex } },
      ],
    })
      .sort({ createdDate: -1 })
      .limit(10); // Limit to 10 results for better performance

    response.status(200).json({
      msg: "Posts retrieved successfully",
      isSuccess: true,
      data: posts,
    });
  } catch (error) {
    console.error("Search posts error:", error);
    response.status(500).json({
      msg: error.message,
      isSuccess: false,
    });
  }
};
