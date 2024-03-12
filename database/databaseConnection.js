import mongoose from "mongoose"; // MongoDB object modeling tool

// Function to establish database connection
function databaseConnection() {
  // Connecting to MongoDB using the provided URI and specifying the database name
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "twitterbackend", // Name of the database
    })
    .then(() => console.log("Database connection established")) // Logging successful connection
    .catch((err) => console.error(err)); // Handling connection errors
}

export default databaseConnection; // Exporting the function for use in other modules
