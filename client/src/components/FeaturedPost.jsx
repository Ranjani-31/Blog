import { Link } from "react-router-dom";

function FeaturedPost({ post }) {
  const image = post.coverImage?.url;
  const category = post.category || "Latest article";
  const dateValue = post.publishedAt || post.createdAt || post.date;
  const date = dateValue ? new Date(dateValue) : null;
  const formattedDate =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";
  const readingTime = post.readingTime;

  return (
    <article className="featured-post">
      <Link
        className="featured-image-link"
        to={`/blog/${post.slug}`}
        aria-label={`Read ${post.title}`}
      >
        {image && (
          <img
            className="featured-image"
            src={image}
            alt={post.imageAlt || post.title}
          />
        )}
        <span className="image-label">
          The long read <span aria-hidden="true">↗</span>
        </span>
      </Link>
      <div className="featured-copy">
        <div className="post-meta">
          <span>{category}</span>
          <span>{readingTime} min read</span>
        </div>
        <h2>
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        <div className="byline">
         
          {formattedDate && (
            <span className="">{formattedDate}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default FeaturedPost;
