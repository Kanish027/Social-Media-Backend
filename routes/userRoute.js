import express from "express"; // Importing the Express framework
import {
  deleteAccount,
  followOrUnfollowUser,
  forgotPassword,
  getAllUsers,
  getCurrentUserProfile,
  getMyTweets,
  getTweetsOfFollowings,
  getUserProfile,
  getUserTweets,
  home,
  login,
  logout,
  resetPassword,
  signup,
  updatePassword,
  updateProfile,
} from "../controllers/userController.js"; // Importing controller functions
import isAuthenticated from "../middleware/auth.js"; // Importing authentication middleware

const router = express.Router(); // Creating an Express router instance

// Routes with corresponding controller functions and middleware
// Home route requiring authentication
router.get("/", isAuthenticated, home);

// Signup route
router.post("/new", signup);

// Login route
router.post("/login", login);

// Logout route requiring authentication
router.get("/logout", isAuthenticated, logout);

// Follow/Unfollow route requiring authentication
router.get("/follow/:id", isAuthenticated, followOrUnfollowUser);

// Route to get tweets of followings requiring authentication
router.get("/tweets", isAuthenticated, getTweetsOfFollowings);

// Route to get logged-in user's tweets requiring authentication
router.get("/my/tweets", isAuthenticated, getMyTweets);

// Route to get tweets of a specific user requiring authentication
router.get("/user/tweets/:id", isAuthenticated, getUserTweets);

// Route to update password requiring authentication
router.put("/update/password", isAuthenticated, updatePassword);

// Route to update profile requiring authentication
router.put("/update/profile", isAuthenticated, updateProfile);

// Route to delete account requiring authentication
router.delete("/delete/account", isAuthenticated, deleteAccount);

// Route to get current user's profile requiring authentication
router.get("/profile/me", isAuthenticated, getCurrentUserProfile);

// Route to get profile of a specific user requiring authentication
router.get("/profile/:id", isAuthenticated, getUserProfile);

// Route to get all users requiring authentication
router.get("/users", isAuthenticated, getAllUsers);

// Route to initiate forgot password process
router.post("/forgot/password", forgotPassword);

// Route to reset password using token
router.put("/reset/password/:token", resetPassword);

// Exporting the router for use in other modules
export default router;
