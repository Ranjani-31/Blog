
const express = require("express");

const validate = require("../middlewares/validate");
const authMiddleware = require("../middlewares/auth.middleware");
const adminValidation = require("../middlewares/admin.middleware")
const {
  createPostSchema,
  updatePostSchema,
} = require("../validators/post.validator");

const {
  getPublishedPosts,
  getPublishedPostBySlug,
  getAllAdminPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} = require("../controllers/post.controller");
const upload= require('../middlewares/upload.middleware')
const router = express.Router();

// Public routes
router.get("/", getPublishedPosts);
router.get("/:slug", getPublishedPostBySlug);

// Admin routes
router.get("/admin/all", authMiddleware,adminValidation, getAllAdminPosts);
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  validate(createPostSchema),
  createPost,
);
router.patch(
  "/admin/edit/:id",
  authMiddleware,
  adminValidation,
  upload.single("image"),
  validate(updatePostSchema),
  updatePost,
);
router.delete("/:id", authMiddleware, deletePost);
router.patch("/:id/publish", authMiddleware, publishPost);
router.patch("/:id/unpublish", authMiddleware, unpublishPost); 

module.exports = router; 
