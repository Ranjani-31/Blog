
const { z } = require("zod");

// Shared field validation
const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

const passwordSchema = z.string()
  .min(12, "Password must contain at least 12 characters")
  .max(128, "Password cannot exceed 128 characters");

// Signup validation
const signupSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(80, "Name cannot exceed 80 characters"),

  email: emailSchema,
  password: passwordSchema,
});

// Login validation
const loginSchema = z.object({
  email: emailSchema,

  password: z.string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

module.exports = {
  signupSchema,
  loginSchema,
};
