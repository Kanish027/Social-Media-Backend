import Tweet from "../models/tweetModel.js"; // Importing the Tweet model
import User from "../models/userModel.js"; // Importing the User model
import { v2 as cloudinary } from "cloudinary"; // Importing cloudinary for image uploading

// Controller function to create a new tweet
const tweet = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (image) {
      // If image is provided, upload to Cloudinary
      const myCloud = await cloudinary.uploader.upload(image, {
        folder: "tweet",
      });

      // Create new tweet with image
      const newTweet = await Tweet.create({
        content: content,
        tweetedBy: req.user._id,
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      });

      // Update user's tweets
      const user = await User.findById(req.user._id);
      user.tweets.push(newTweet._id);
      await user.save();

      res.status(200).json({
        success: true,
        data: newTweet,
      });
    } else {
      // If no image is provided, create new tweet without an image
      const newTweet = await Tweet.create({
        content: content,
        tweetedBy: req.user._id,
      });

      // Update user's tweets
      const user = await User.findById(req.user._id);
      user.tweets.push(newTweet._id);
      await user.save();

      res.status(200).json({
        success: true,
        data: newTweet,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to delete a tweet
const deleteTweet = async (req, res) => {
  try {
    // Check if the tweet exists
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }
    // Check if the user is the owner of the tweet
    if (tweet.tweetedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You are not the owner of this tweet",
      });
    }
    if (tweet.image && tweet.image.public_id) {
      // If image is present, destroy it in Cloudinary
      await cloudinary.uploader.destroy(tweet.image.public_id);
    }
    // Delete the tweet
    await Tweet.findByIdAndDelete(req.params.id);
    // Remove tweet count from users tweet
    const user = await User.findById(req.user._id);
    const index = user.tweets.indexOf(req.params.id);
    user.tweets.splice(index, 1);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Tweet deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to like/unlike a tweet
const likeAndUnlike = async (req, res) => {
  try {
    // Check if the tweet exists
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }
    // Check if the user has liked the tweet
    if (tweet.likes.includes(req.user._id)) {
      const index = tweet.likes.indexOf(req.user._id);
      tweet.likes.splice(index, 1);
      await tweet.save();
      return res.status(200).json({
        success: true,
        message: "Tweet unliked",
      });
    } else {
      tweet.likes.push(req.user._id);
      await tweet.save();
      return res.status(200).json({
        success: true,
        message: "Tweet liked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to update a tweet
const updateTweet = async (req, res) => {
  try {
    // Check if the tweet exists
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }
    // Check if the user is the owner of the tweet
    if (tweet.tweetedBy.toString() !== req.user._id.toString()) {
      res.status(404).json({
        success: false,
        message: "You are not the owner of this tweet",
      });
    }

    const { content } = req.body;
    tweet.content = content;
    await tweet.save();
    res.status(200).json({
      success: true,
      message: "Tweet updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to add a comment to a tweet
const addComment = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }
    let commentIndex = -1;

    tweet.comments.forEach((comment, index) => {
      if (comment.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      tweet.comments[commentIndex].comment = req.body.comment;
      await tweet.save();
      res.status(200).json({
        success: true,
        message: "Comment updated",
      });
    } else {
      tweet.comments.push({
        user: req.user,
        comment: req.body.comment,
      });
      await tweet.save();
      res.status(200).json({
        success: true,
        message: "Comment added",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to delete a comment from a tweet
const deleteComment = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }
    // Check if the owner of the tweet wants to delete comment
    if (tweet.tweetedBy.toString() === req.user._id.toString()) {
      if (req.body.commentId === undefined) {
        return res.status(400).json({
          success: false,
          message: "Comment Id is required",
        });
      }
      tweet.comments.forEach((comment, index) => {
        if (comment._id.toString() === req.body.commentId.toString()) {
          return tweet.comments.splice(index, 1);
        }
      });
      await tweet.save();
      res.status(200).json({
        success: true,
        message: "Comment deleted",
      });
    } else {
      // Delete comment by the user
      tweet.comments.forEach((comment, index) => {
        if (comment.user.toString() === req.user._id.toString()) {
          return tweet.comments.splice(index, 1);
        }
      });
      await tweet.save();
      res.status(200).json({
        success: true,
        message: "Your comment has been deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to handle retweeting a tweet
const retweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id).populate("tweetedBy");

    if (!tweet) {
      return res.status(404).json({
        success: true,
        message: "Tweet not found",
      });
    }

    res.status(200).send(tweet);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to retrieve all comments of a tweet
const getAllComments = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }
    res.status(200).json({
      success: true,
      data: tweet.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to add a reply to a comment
const reply = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({
        success: false,
        message: "Tweet not found",
      });
    }

    const commentId = req.body.commentId;
    const comment = tweet.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const replyText = req.body.reply;

    tweet.replies.push({
      user: req.user._id,
      reply: replyText,
    });

    await tweet.save();

    res.status(200).json({
      success: true,
      message: "Reply added to the comment",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Exporting controller functions
export {
  tweet,
  likeAndUnlike,
  deleteTweet,
  updateTweet,
  addComment,
  deleteComment,
  retweet,
  reply,
  getAllComments,
};
