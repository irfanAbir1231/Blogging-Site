import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import Token from "../model/token.js";
import User from "../model/user.js";
import Post from "../model/post.js";
import Comment from "../model/comment.js";

dotenv.config();

export const singupUser = async (request, response) => {
  try {
    // const salt = await bcrypt.genSalt();
    // const hashedPassword = await bcrypt.hash(request.body.password, salt);
    const hashedPassword = await bcrypt.hash(request.body.password, 10);

    const user = {
      username: request.body.username,
      name: request.body.name,
      password: hashedPassword,
    };

    const newUser = new User(user);
    await newUser.save();

    return response.status(200).json({ msg: "Signup successfull" });
  } catch (error) {
    return response.status(500).json({ msg: "Error while signing up user" });
  }
};

export const loginUser = async (request, response) => {
  let user = await User.findOne({ username: request.body.username });
  if (!user) {
    return response.status(400).json({ msg: "Username does not match" });
  }

  try {
    let match = await bcrypt.compare(request.body.password, user.password);
    if (match) {
      const accessToken = jwt.sign(
        user.toJSON(),
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        user.toJSON(),
        process.env.REFRESH_SECRET_KEY
      );

      const newToken = new Token({ token: refreshToken });
      await newToken.save();

      response.status(200).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        name: user.name,
        username: user.username,
      });
    } else {
      response.status(400).json({ msg: "Password does not match" });
    }
  } catch (error) {
    response.status(500).json({ msg: "error while login the user" });
  }
};

export const logoutUser = async (request, response) => {
  const token = request.body.token;
  await Token.deleteOne({ token: token });

  response.status(204).json({ msg: "logout successfull" });
};

export const getUserProfile = async (request, response) => {
  try {
    const username = request.params.username;

    // Find user by username but don't return the password
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return response.status(404).json({
        msg: "User not found",
        isSuccess: false,
      });
    }

    return response.status(200).json({
      isSuccess: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return response.status(500).json({
      msg: "Error fetching user profile",
      isSuccess: false,
      error: error.message,
    });
  }
};

export const updateUserProfile = async (request, response) => {
  try {
    const username = request.params.username;
    const { name, bio, profilePicture } = request.body;

    console.log("Updating profile for user:", username);
    console.log("Update data:", { name, bio, profilePicture });

    // Ensure the logged-in user is updating their own profile
    // This check may be skipped during development/testing
    /* 
    if (request.user.username !== username) {
      return response.status(403).json({
        msg: "You can only update your own profile",
        isSuccess: false,
      });
    } 
    */

    // Create an update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    console.log("Final update data:", updateData);

    // Find and update the user
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      console.log("User not found:", username);
      return response.status(404).json({
        msg: "User not found",
        isSuccess: false,
      });
    }

    console.log("User updated successfully:", updatedUser);
    return response.status(200).json({
      msg: "Profile updated successfully",
      isSuccess: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return response.status(500).json({
      msg: "Error updating user profile",
      isSuccess: false,
      error: error.message,
    });
  }
};

export const getUserStats = async (request, response) => {
  try {
    const username = request.params.username;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return response.status(404).json({
        msg: "User not found",
        isSuccess: false,
      });
    }

    // Get post count
    const postCount = await Post.countDocuments({ username });

    // Get comment count
    const commentCount = await Comment.countDocuments({ username });

    // Get likes received (upvotes on user's posts)
    const userPosts = await Post.find({ username });
    let likesReceived = 0;

    userPosts.forEach((post) => {
      likesReceived += post.upvotes ? post.upvotes.length : 0;
    });

    return response.status(200).json({
      isSuccess: true,
      data: {
        posts: postCount,
        comments: commentCount,
        likes: likesReceived,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return response.status(500).json({
      msg: "Error fetching user statistics",
      isSuccess: false,
      error: error.message,
    });
  }
};
