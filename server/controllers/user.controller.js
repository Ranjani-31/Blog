const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const COOKIE_NAME = "token";
const TOKEN_EXPIRY = "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

// POST /user/signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.validatedBody;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return res.status(201).json({
    message: "Account created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// POST /user/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;

  // Password is select:false in the User schema.
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { userId: user._id.toString(),
      role: user.role
     },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  res.cookie(COOKIE_NAME, token, getCookieOptions());

  return res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// GET /user/me
// Requires authentication middleware.
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select("name email");

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  return res.status(200).json({ user });
});

// POST /user/logout
const logout = asyncHandler((req, res) => {
  res.clearCookie(COOKIE_NAME, getClearCookieOptions());

  return res.status(200).json({
    message: "Logout successful",
  });
});

module.exports = {
  signup,
  login,
  logout,
  getMe,
};
