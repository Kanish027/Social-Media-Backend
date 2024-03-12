import mongoose from "mongoose"; // MongoDB object modeling tool
import bcrypt from "bcrypt"; // Library for hashing passwords
import jwt from "jsonwebtoken"; // Library for generating JSON web tokens
import crypto from "crypto"; // Library for cryptographic functions

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name"], // Name is required
    },
    username: {
      type: String,
      required: [true, "Please enter a username"], // Username is required
      unique: true,
    },
    avatar: {
      public_id: String, // Public ID for avatar image in cloud storage
      avatar_url: String, // URL for avatar image
    },
    email: {
      type: String,
      required: [true, "Please enter a email"], // Email is required
      unique: [true, "Email already exists"], // Email must be unique
    },
    password: {
      type: String,
      required: [true, "Please enter a password"], // Password is required
      minlength: [6, "Password must be at least 6 characters"], // Minimum length for password
      select: false, // Password won't be returned in queries by default
    },
    tweets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet", // Reference to Tweet model
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model for followers
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model for followings
      },
    ],
    location: {
      type: String,
    },
    dob: {
      type: Date,
    },
    resetPasswordToken: String, // Token for password reset
    resetPasswordExpires: Date, // Expiry time for password reset token
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  }
);

// Hash password before saving user to database
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate authentication token for user
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET); // Signing token with user's ID and secret
};

// Method to generate and store password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); // Hashing reset token before storing
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token expiry time (10 minutes)

  return resetToken; // Returning unhashed reset token for sending in email
};

// Creating User model from the schema
const User = new mongoose.model("User", userSchema);

// Exporting User model
export default User;
