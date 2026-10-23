
const { z } = require("zod");



const postFields = {
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().min(1).max(300),
  content: z.string().min(1),
  
  status: z.enum(["draft", "published"])
};

const createPostSchema = z.object({
  ...postFields,
  
});

const updatePostSchema = z.object({
  title: postFields.title.optional(),
  excerpt: postFields.excerpt.optional(),
  content: postFields.content.optional(),
  status: z.enum(["draft", "published"]),
  removeCoverImage: z.enum(["true", "false"]).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);

module.exports = {
  createPostSchema,
  updatePostSchema,
};
