const mongoose = require("mongoose");
const slugify = require("slugify");
const Post = require("../models/post");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinaryImage");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const createSlug = (title) =>
  slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

const isValidId = (id) => mongoose.isValidObjectId(id);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/posts
// Public: published posts only
const getPublishedPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit) || 10;
  

  const filter = { status: "published" };
console.log("...")
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select("-content")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Post.countDocuments(filter),
  ]);
console.log(posts, "posts")
  return res.status(200).json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/posts/:slug
// Public: published posts only
const getPublishedPostBySlug = asyncHandler(async (req, res) => {
 
  const post = await Post.findOne({
    slug: req.params.slug,
    
  }).lean();

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return res.status(200).json({ post });
});

// GET /api/posts/admin/all
// Admin: drafts and published posts
const getAllAdminPosts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
  );

  const filter = {};

  if (["draft", "published"].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  if (typeof req.query.search === "string" && req.query.search.trim()) {
    filter.title = {
      $regex: escapeRegex(req.query.search.trim().slice(0, 200)),
      $options: "i",
    };
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Post.countDocuments(filter),
  ]);

  return res.status(200).json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// POST /api/posts
// Admin: create a post
const createPost = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Cover image required", 400);
  }
  const data = req.validatedBody;
  const slug = createSlug(data.title);

  if (!slug) {
    throw new AppError("Unable to generate a slug from this title", 400);
  }
  const status = data.status || "draft";
  const image = await uploadToCloudinary(req.file);
  const post = await Post.create({
    ...data,
    slug,
    status,
    coverImage: {
      url: image?.secure_url,
      publicId: image?.public_id,
    },
    publishedAt: status === "published" ? new Date() : null,
  });

  return res.status(201).json({
    message: "Post created successfully",
    post,
  });
});

// PATCH /api/posts/:id
// Admin: update a post
const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id, "slug...")
  if (!isValidId(id)) {
    throw new AppError("Invalid slug", 400);
  }

  const data = req.validatedBody;
  const post = await Post.findById(id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const wasPublished = post.status === "published";

  if (data.title !== undefined) {
    const newSlug = createSlug(data.title);

    if (!newSlug) {
      throw new AppError("Unable to generate a slug from this title", 400);
    }

    post.title = data.title;
    post.slug = newSlug;
  }

  for (const field of ["excerpt", "content", "coverImage", "readingTime"]) {
    if (data[field] !== undefined) {
      post[field] = data[field];
    }
  }

  if (data.status !== undefined) {
    post.status = data.status;

    if (data.status === "published" && !wasPublished) {
      post.publishedAt = new Date();
    }

    if (data.status === "draft") {
      post.publishedAt = null;
    }
  }

  if (req.file) {
    const deleteImage = await deleteFromCloudinary(req.file)
    console.log(deleteImage, "delete image....")
    if(deleteImage){
 const image = await uploadToCloudinary(req.file);
    post.coverImage = {
      url: image.secure_url,
      publicId: image.public_id,
    };
    }
   
  } else if (data.removeCoverImage === "true") {
    post.coverImage = { url: null, publicId: null };
  }

  await post.save();

  return res.status(200).json({
    message: "Post updated successfully",
    post,
  }); 
});

// DELETE /api/posts/:id
// Admin: delete a post
const deletePost = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await Post.findByIdAndDelete(req.params.id);
  await deleteFromCloudinary(post.image.url)
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return res.status(200).json({
    message: "Post deleted successfully",
  });
});

// PATCH /api/posts/:id/publish
const publishPost = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.status !== "published") {
    post.status = "published";
    post.publishedAt = new Date();
    await post.save();
  }

  return res.status(200).json({
    message: "Post published successfully",
    post,
  });
});

// PATCH /api/posts/:id/unpublish
const unpublishPost = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new AppError("Invalid post ID", 400);
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  post.status = "draft";
  post.publishedAt = null;
  await post.save();

  return res.status(200).json({
    message: "Post unpublished successfully",
    post,
  });
});

module.exports = {
  getPublishedPosts,
  getPublishedPostBySlug,
  getAllAdminPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
};
