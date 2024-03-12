import crypto from "crypto";
import sendEmail from "../middleware/sendEmail.js"; // Importing email sending middleware
import Tweet from "../models/tweetModel.js"; // Importing Tweet model
import User from "../models/userModel.js"; // Importing User model
import { v2 as cloudinary } from "cloudinary"; // Importing cloudinary for image uploading

// Controller function for the home route
const home = (req, res) => {
  res.send("Nice, Its working");
};

// Controller function for user signup
const signup = async (req, res) => {
  const { name, email, password, username, avatar } = req.body;
  try {
    // Check if the user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }

    // Upload avatar if provided
    if (avatar) {
      const myCloud = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
      });
      const newUser = new User({
        name: name,
        username: username,
        email: email,
        password: password,
        avatar: {
          public_id: myCloud.public_id,
          avatar_url: myCloud.secure_url,
        },
      });
      const savedUser = await newUser.save();
      const token = await newUser.generateAuthToken();
      res
        .status(201)
        .cookie("token", token, {
          expires: new Date(Date.now() + 3600000),
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
          secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
        })
        .json({
          success: true,
          message: "User created successfully",
          data: savedUser,
        });
    } else {
      // Create user without avatar if not provided
      const newUser = new User({
        name: name,
        username: username,
        email: email,
        password: password,
      });
      const savedUser = await newUser.save();
      const token = await newUser.generateAuthToken();
      res
        .status(201)
        .cookie("token", token, {
          expires: new Date(Date.now() + 3600000),
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
          secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
        })
        .json({
          success: true,
          message: "User created successfully",
          data: savedUser,
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function for user login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user is registered
    const user = await User.findOne({ email })
      .select("+password")
      .populate("followings followers");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // Check if the password is correct
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
    const token = await user.generateAuthToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
        secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
      })
      .json({
        success: true,
        message: "User logged in successfully",
        user,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function for user logout
const logout = (req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
      secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
};

// Controller function to follow or unfollow users
const followOrUnfollowUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // User cannot follow himself
    if (userToFollow._id.equals(currentUser._id)) {
      return res.status(401).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Unfollow user if the user is already following
    if (currentUser.followings.includes(userToFollow._id)) {
      const indexFollowings = currentUser.followings.indexOf(userToFollow._id);
      const indexFollowers = userToFollow.followers.indexOf(currentUser._id);

      currentUser.followings.splice(indexFollowings, 1);
      userToFollow.followers.splice(indexFollowers, 1);

      await userToFollow.save();
      await currentUser.save();

      res.status(200).json({
        success: true,
        message: "User Unfollowed",
      });
    } else {
      // Managing users and current users followers and followings
      userToFollow.followers.push(currentUser._id);
      currentUser.followings.push(userToFollow._id);
      // Save Followings and followings
      await userToFollow.save();
      await currentUser.save();
      res.status(200).json({
        success: true,
        message: "User Followed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to get tweets of followings
const getTweetsOfFollowings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const tweets = await Tweet.find({
      tweetedBy: {
        $in: user.followings,
      },
    }).populate("tweetedBy likes comments.user replies.user");

    res.status(200).json({
      success: true,
      tweets: tweets.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to get user's own tweets
const getMyTweets = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const tweets = [];

    for (let i = 0; i < user.tweets.length; i++) {
      const tweet = await Tweet.findById(user.tweets[i]).populate(
        "likes tweetedBy comments.user"
      );
      tweets.push(tweet);
    }
    res.status(200).json({
      success: true,
      tweets: tweets.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to get user's tweets by user ID
const getUserTweets = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const tweets = [];

    for (let i = 0; i < user.tweets.length; i++) {
      const tweet = await Tweet.findById(user.tweets[i]).populate(
        "likes tweetedBy comments.user"
      );
      tweets.push(tweet);
    }
    res.status(200).json({
      success: true,
      tweets: tweets.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to update user's password
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(404).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    const isPasswordMatch = await user.matchPassword(oldPassword);
    if (!isPasswordMatch) {
      return res.status(404).json({
        success: false,
        message: "Old password is incorrect",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to update user's profile information
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, email, location, dob, avatar } = req.body;

    if (email) {
      user.email = email;
    }
    if (name) {
      user.name = name;
    }
    if (location) {
      user.location = location;
    }
    if (dob) {
      user.dob = new Date(dob);
    }

    if (avatar !== null) {
      // If the user does not have an avatar, create a new entry
      if (!user.avatar) {
        user.avatar = {
          public_id: "",
          avatar_url: "",
        };
      } else {
        // If the user has an existing avatar and the new avatar is null, destroy it
        if (user.avatar.public_id && avatar === null) {
          await cloudinary.uploader.destroy(user.avatar.public_id);
          user.avatar.public_id = ""; // Clear public_id after destroying the asset
          user.avatar.avatar_url = ""; // Clear avatar_url as well
        }
      }

      // Upload the new avatar if it is not null
      if (avatar !== null) {
        const myCloud = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
        });

        user.avatar.public_id = myCloud.public_id;
        user.avatar.avatar_url = myCloud.secure_url;
      }
    } else {
      // If avatar is null, delete the existing avatar from Cloudinary
      if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
        user.avatar.public_id = ""; // Clear public_id after destroying the asset
        user.avatar.avatar_url = ""; // Clear avatar_url as well
      }
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to delete user account
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const tweets = user.tweets;

    // Delete all tweets associated with the user and remove their images from Cloudinary
    for (const tweetId of tweets) {
      const tweet = await Tweet.findById(tweetId);
      if (tweet && tweet.image && tweet.image.public_id) {
        await cloudinary.uploader.destroy(tweet.image.public_id);
      }
    }

    // Delete all tweets associated with the user
    await Tweet.deleteMany({ _id: { $in: tweets } });

    // Remove all comments associated with all tweets
    const allTweets = await Tweet.find();
    for (let i = 0; i < allTweets.length; i++) {
      const tweet = await Tweet.findById(allTweets[i]._id);
      for (let j = 0; j < tweet.comments.length; j++) {
        if (tweet.comments[j].user.toString() === req.user._id.toString()) {
          tweet.comments.splice(j, 1);
        }
      }
      await tweet.save();
    }

    // Remove the user
    await user.deleteOne();

    // Remove the deleted user from the other users' followers and followings
    await User.updateMany(
      {},
      {
        $pull: {
          followers: req.user._id,
          followings: req.user._id,
        },
      }
    );

    // Remove the user's avatar from Cloudinary
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    res.cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
      secure: process.env.NODE_ENV === "DEVELOPMENT" ? false : true,
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to get current user's profile
const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "tweets followers followings"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to get user profile by ID
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "tweets followings followers"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to get all users
const getAllUsers = async (req, res) => {
  try {
    // Not include the current user
    const users = await User.find({
      _id: { $ne: req.user._id },
      name: { $regex: req.query.name, $options: "i" },
    });
    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function for forgot password
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const resetPasswordToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset/password/${resetPasswordToken}`;
    const message = `Reset your password by clicking the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent successfully to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function for resetting password
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Exporting all controller functions
export {
  deleteAccount,
  followOrUnfollowUser,
  forgotPassword,
  getAllUsers,
  getCurrentUserProfile,
  getMyTweets,
  getUserTweets,
  getTweetsOfFollowings,
  getUserProfile,
  home,
  login,
  logout,
  resetPassword,
  signup,
  updatePassword,
  updateProfile,
};
