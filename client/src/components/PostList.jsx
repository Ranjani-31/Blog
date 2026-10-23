import { useEffect, useRef } from "react";
import PostCard from "./PostCard";
import "./PostList.css";

function PostList({
  posts = [],
  totalCount = posts.length,
  loading = false,
  loadingMore = false,
  hasMore = false,
  error = "",
  onLoadMore,
  onRetry,
}) {
  const loadMoreRef = useRef(null);

  
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loading || loadingMore || error || !onLoadMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { rootMargin: "250px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [error, hasMore, loading, loadingMore, onLoadMore]);

  return (
    <section className="post-list-section" id="writing">
      <div className="post-list-heading">
        <div>
          <span className="section-eyebrow">
            THE DEVELOPER JOURNAL
          </span>
          <h2>Latest writing</h2>
          <p>
            Projects, ideas, problems, and things I've learned.
          </p>
        </div>

        <span className="post-count">
            {totalCount} articles
        </span>
      </div>

      <div className="post-list">
        {posts.map((post) => (
            <PostCard key={post._id || post.id || post.slug} post={post} />
        ))}
      </div>

      {loading && (
        <p className="post-list-state" role="status">
          Loading articles...
        </p>
      )}

      {!loading && error && (
        <div className="post-list-state post-list-error" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button className="load-more-btn" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      )}

      {!loading && !error && totalCount === 0 && (
        <p className="post-list-state">
          No published posts yet. Check back soon.
        </p>
      )}

      {!loading && !error && totalCount > 0 && posts.length >0 && !hasMore && (
        <p className="post-list-state">You're caught up. No more articles yet.</p>
      )}

      {hasMore && !error && (
        <div ref={loadMoreRef} className="post-list-load-more">
          {loadingMore ? (
            <p className="post-list-state" role="status">
              Loading more articles...
            </p> 
          ) : (
            <button className="load-more-btn" onClick={onLoadMore}>
              Load more articles <span>↓</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default PostList;