import mongoose from "mongoose"; // MongoDB object modeling tool

// Define the schema for the Tweet model
const tweetSchame = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true, // Content of the tweet is required
    },
    tweetedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model for the user who tweeted
    },
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model for users who liked the tweet
        },
      ],
    },
    retweetedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    image: {
      public_id: String, // Public ID for the image in cloud storage
      url: String, // URL for the image
    },

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model for the user who commented
        },
        comment: {
          type: String,
          required: true, // Comment text is required
        },
      },
    ],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User model for the user who replied
        },
        reply: {
          type: String,
          required: true, // Reply text is required
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  }
);

// Creating Tweet model from the schema
const Tweet = mongoose.model("Tweet", tweetSchame);

// Exporting Tweet model
export default Tweet;
