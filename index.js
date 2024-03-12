// Importing necessary modules from npm packages
import { v2 as cloudinary } from "cloudinary"; // Cloudinary module for image storage
import cookieParser from "cookie-parser"; // Middleware for parsing cookies
import cors from "cors"; // Middleware for enabling Cross-Origin Resource Sharing (CORS)
import "dotenv/config"; // Module for loading environment variables from .env file
import express from "express"; // Express.js framework for building web applications
import databaseConnection from "./database/databaseConnection.js"; // Custom module for connecting to the database
import tweetRouter from "./routes/tweetRoute.js"; // Router module for tweet-related routes
import userRouter from "./routes/userRoute.js"; // Router module for user-related routes

// Initializing the Express application
const app = express();

// Connecting to the database
databaseConnection();

// Configuring Cloudinary for image storage
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Cloudinary cloud name
  api_key: process.env.API_KEY, // Cloudinary API key
  api_secret: process.env.API_SECRET, // Cloudinary API secret key
});

// Setting up middleware for parsing JSON requests with a size limit of 50mb
app.use(express.json({ limit: "50mb" }));

// Setting up middleware for parsing URL-encoded requests with a size limit of 50mb and extended options
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setting up middleware for parsing cookies
app.use(cookieParser());

// Mounting tweet-related routes to '/api/v1/tweets'
app.use("/api/v1/tweets", tweetRouter);

// Mounting user-related routes to '/api/v1/users'
app.use("/api/v1/users", userRouter);

// Enabling CORS with specified options
app.use(
  cors({
    origin: [process.env.FRONTEND_URI], // Allowed origin for requests
    methods: ["GET", "POST, PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allowing credentials to be included in requests
  })
);

// Starting the Express server, listening on the specified port from environment variables
app.listen(process.env.PORT, () => {
  console.log(
    `Server is listening on PORT ${process.env.PORT} in ${process.env.NODE_ENV} Mode`
  );
});
