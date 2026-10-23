import { Link } from "react-router-dom";
import "./PostCard.css";

function PostCard({ post }) {
  const publishedDate = post.publishedAt || post.createdAt || post.date;
  const date = publishedDate ? new Date(publishedDate) : null;
  const formattedDate =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently";
  const dateTime =
    date && !Number.isNaN(date.getTime())
      ? date.toISOString().slice(0, 10)
      : undefined;
  const readTime =
    post.readingTime != null
      ? `${post.readingTime} min read`
      : post.readTime || "1 min read";
console.log(post, "postt,...")
  return (
    <article className="post-card">
      <div className="post-card-meta">
        <time dateTime={dateTime}>{formattedDate}</time>
        <span className="post-meta-dot">·</span>
        <span>{readTime}</span>
      </div>

      <h3 className="post-card-title">
        <Link to={`/blog/${post.slug}`}>
          {post.title}
        </Link>
      </h3>

      <p className="post-card-excerpt">
        {post.excerpt}
      </p>

      <Link
        to={`/blog/${post.slug}`}
        className="post-card-link"
        aria-label={`Read ${post.title}`}
      >
        
        Read article <span>↗</span>
      </Link>
    </article>
  );
}

export default PostCard;