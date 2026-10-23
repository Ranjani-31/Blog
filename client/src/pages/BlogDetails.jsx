import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import api from "../api/axios";
import "./BlogDetails.css";

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function BlogDetails() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [activeHeading, setActiveHeading] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      setLoading(true);
      setError(null);
      setPost(null);

      try {
        const { data } = await api.get(
          `/posts/${encodeURIComponent(slug)}`,
        );

        if (!data.post) {
          throw new Error("The server did not return this article.");
        }
        

        if (!cancelled) setPost(data.post);
      } catch (requestError) {
        if (cancelled) return;

        setError({
          notFound: requestError.response?.status === 404,
          message:
            requestError.response?.data?.message ||
            "Unable to load this article. Please try again.",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [retryKey, slug]);

  const content = post?.content || "";
  const headings = useMemo(
    () =>
      [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => ({
        level: match[1].length,
        title: match[2].trim(),
        id: createSlug(match[2]),
      })),
    [content],
  );

  useEffect(() => {
    if (!headings.length) return undefined;

    let animationFrame = 0;

    function updateActiveHeading() {
      animationFrame = 0;
      const threshold = window.innerHeight * 0.25;
      let currentHeading = headings[0]?.id || "";

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= threshold) {
          currentHeading = heading.id;
        }
      }

      setActiveHeading(currentHeading);
    }

    function scheduleUpdate() {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateActiveHeading);
      }
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [headings]);

  if (loading) {
    return (
      <main className="article-not-found" role="status">
        <p>Loading article...</p>
      </main>
    );
  }

  if (error?.notFound) {
    return (
      <main className="article-not-found">
        <h1>Article not found</h1>
        <p>This article may have been moved or doesn't exist.</p>
        <Link to="/">← Back to home</Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className="article-not-found" role="alert">
        <h1>Unable to load article</h1>
        <p>{error.message}</p>
        <button
          type="button"
          className="article-retry-button"
          onClick={() => setRetryKey((currentKey) => currentKey + 1)}
        >
          Try again
        </button>
        <p>
          <Link to="/">← Back to home</Link>
        </p>
      </main>
    );
  }

  if (!post) return null;

  const dateValue = post.publishedAt || post.createdAt;
  const date = dateValue ? new Date(dateValue) : null;
  const formattedDate =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";
  return (
    <main className="article-page">
      <div className="article-container">
        <Link to="/" className="article-back-link">
          ← Back to writing
        </Link>

        <header className="article-header">
          <div className="article-meta">
            {formattedDate && (
              <>
                <time dateTime={date.toISOString()}>{formattedDate}</time>
                <span>·</span>
              </>
            )}
            <span>{post.readingTime || 1} min read</span>
          </div>

          <h1>{post.title}</h1>
          <img src={post.coverImage.url}/>
          <p className="article-excerpt">
            {post.excerpt}
          </p>
     
        </header>

        <div className="article-layout">
          <article className="article-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h2: ({ children, ...props }) => {
                  const title = String(children);
                  return (
                    <h2 id={createSlug(title)} {...props}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children, ...props }) => {
                  const title = String(children);
                  return (
                    <h3 id={createSlug(title)} {...props}>
                      {children}
                    </h3>
                  );
                },
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    target={
                      href?.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      href?.startsWith("http")
                        ? "noreferrer"
                        : undefined
                    }
                    {...props}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>

          {headings.length > 0 && (
            <aside className="article-toc">
              <h2>On this page</h2>

              <nav aria-label="Table of contents">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={
                      [
                        "toc-link",
                        heading.level === 3 && "toc-link-nested",
                        activeHeading === heading.id && "toc-link-active",
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                    aria-current={
                      activeHeading === heading.id ? "location" : undefined
                    }
                  >
                    {heading.title}
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>

        <footer className="article-footer">
          <p>Thanks for reading.</p>
          <Link to="/">Explore more writing →</Link>
        </footer>
      </div>
    </main>
  );
}

export default BlogDetails;