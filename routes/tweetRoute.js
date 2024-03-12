import express from "express"; // Importing the Express framework
import isAuthenticated from "../middleware/auth.js"; // Importing authentication middleware
import {
  addComment,
  deleteComment,
  deleteTweet,
  getAllComments,
  likeAndUnlike,
  reply,
  retweet,
  tweet,
  updateTweet,
} from "../controllers/tweetController.js"; // Importing controller functions

// Creating an Express router instance
const router = express.Router();

// Routes with corresponding controller functions and middleware

// Route to handle GET request for tweets (placeholder)
router.get("/", isAuthenticated, (req, res) => {
  res.send("Tweets");
});

// Route to handle POST request for creating a tweet
router.post("/tweet", isAuthenticated, tweet);

// Route to handle POST request for liking/unliking a tweet
router.post("/tweet/:id", isAuthenticated, likeAndUnlike);

// Route to handle DELETE request for deleting a tweet
router.delete("/tweet/:id", isAuthenticated, deleteTweet);

// Route to handle PUT request for updating a tweet
router.put("/tweet/:id", isAuthenticated, updateTweet);

// Route to handle POST request for retweeting
router.post("/tweet/retweet/:id", isAuthenticated, retweet);

// Route to handle PUT request for adding a comment to a tweet
router.put("/comment/:id", isAuthenticated, addComment);

// Route to handle POST request for replying to a comment
router.post("/comment/reply/:id", isAuthenticated, reply);

// Route to handle GET request for retrieving all comments of a tweet
router.get("/comments/:id", isAuthenticated, getAllComments);

// Route to handle DELETE request for deleting a comment
router.delete("/comment/:id", isAuthenticated, deleteComment);

// Exporting the router for use in other modules
export default router;
