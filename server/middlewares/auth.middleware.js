const jwt = require("jsonwebtoken");

const User = require("../models/userSchema");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  // 1. Read the token from the HTTP-only cookie
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  // 2. Verify the token
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      throw new AppError("Invalid or expired token", 401);
    }

    throw error;
  }

  // 3. Extract the user ID from the verified payload
  const userId = decoded.userId;

  if (!userId) {
    throw new AppError("Invalid authentication token", 401);
  }

  // 4. Find the user in MongoDB
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  // 5. Attach the authenticated user to the request
  req.user = user;
  

  // 6. Continue to the next middleware or controller
  next();
});

module.exports = authMiddleware;