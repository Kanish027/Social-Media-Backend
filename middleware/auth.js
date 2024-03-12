import jwt from "jsonwebtoken"; // Library for generating and verifying JSON web tokens
import User from "../models/userModel.js"; // Importing the User model

// Middleware function to check if the user is authenticated
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies; // Extracting JWT token from request cookies

  // If token is not present, send unauthorized response
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login to continue", // Informing user to login to continue
    });
  }
  // Verifying the token using JWT_SECRET from environment variables
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  // Finding the user corresponding to the decoded token ID
  req.user = await User.findById(decoded._id);
  // Proceeding to the next middleware
  next();
};

// Exporting the isAuthenticated middleware
export default isAuthenticated;
