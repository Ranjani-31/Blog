
const express = require("express");

const validate = require("../middlewares/validate");
const { loginSchema , signupSchema} = require("../validators/user.validator");

const {
  login,
  getMe,
  logout,
  signup
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();
router.post("/signup", validate(signupSchema), signup);

router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, getMe);
router.post("/logout", logout);

module.exports = router;
