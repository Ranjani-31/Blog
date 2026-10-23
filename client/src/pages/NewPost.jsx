
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import ThemeToggle from "../components/ThemeToggle";
import api from "../api/axios";
import "./NewPost.css";

// Convert a title or custom slug into a URL-friendly slug.
function createSlug(value = "") {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Frontend preview only. The backend should calculate
// and store the authoritative reading time.
function estimateReadingTime(content = "") {
  const words = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  return Math.max(1, Math.ceil(words / 200));
}

function NewPost() {
  const navigate = useNavigate();

  const { slug: editSlug } = useParams();
  
  const [postId, setPostId] = useState(null);

  const [title, setTitle] = useState( "");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState(  "");
  const [status, setStatus] = useState("draft");

  const [coverImage, setCoverImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeExistingCover, setRemoveExistingCover] =
    useState(false);

  const [preview, setPreview] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(editSlug));

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(Boolean(editSlug));

  const readingTime = useMemo(
    () => estimateReadingTime(content),
    [content]
  );

  const wordCount = useMemo(
    () => (content.trim() ? content.trim().split(/\s+/).length : 0),
    [content]
  );

  // Load an existing article when editing.
  useEffect(() => {
    if (!editSlug) return;

    let cancelled = false;

    async function loadPost() {
      try {
        setLoadingPost(true);
        setError("");

        const { data } = await api.get(
          `/posts/${(editSlug)}`
        );
         
        if (cancelled) return;

        const post = data.post;

        setPostId(post._id);
        setTitle(post.title || "");
        setSlug(post.slug || "");
        setExcerpt(post.excerpt || "");
        setContent(post.content || "");
        setCoverImage(post.coverImage?.url || "");
        setStatus(post.status || "draft");
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load this article."
          );
        }
      } finally {
        if (!cancelled) setLoadingPost(false);
      }
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [editSlug]);

  // Release temporary browser image previews.
  useEffect(() => {
    return () => {
      if (coverImage.startsWith("blob:")) {
        URL.revokeObjectURL(coverImage);
      }
    };
  }, [coverImage]);

  // Generate the slug automatically until manually edited.
  function handleTitleChange(value) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(createSlug(value));
    }
  }

  function handleCoverChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setError("");
    setSelectedFile(file);
    setCoverImage(URL.createObjectURL(file));
    setRemoveExistingCover(false);
  }

  function handleRemoveCover() {
    setCoverImage("");
    setSelectedFile(null);
    setRemoveExistingCover(true);
  }

  async function handleSave(nextStatus = status) {
    if (!selectedFile && !postId) {
      setError("Choose a cover image before saving.");
      return;
    }
    const cleanTitle = title.trim();
    const cleanSlug = createSlug(slug);
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanSlug || !cleanContent) {
      setError("Title, URL slug, and article content are required.");
      return;
    }

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", cleanTitle);
      formData.append("slug", cleanSlug);
      formData.append("excerpt", excerpt.trim());
      formData.append("content", content);
      formData.append("status", nextStatus.toLowerCase());
      formData.append("publishedAt", new Date())
      if (selectedFile) {
        formData.append("image", selectedFile);
      } else if (postId && removeExistingCover) {
        formData.append("removeCoverImage", "true");
      }
      if (postId) {
        await api.patch(`/posts/admin/edit/${postId}`, formData);
      } else {
        await api.post("/posts", formData);
      }

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the article. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingPost) {
    return <main className="editor-page">Loading article...</main>;
  }

  return (
    <main className="editor-page">
      <header className="editor-topbar">
        <Link to="/admin" className="editor-back">
          ← Dashboard
        </Link>

        <div className="editor-top-actions">
          <ThemeToggle />

          <span className={`editor-status ${status}`}>
            {status}
          </span>

          <button
            type="button"
            className="editor-button editor-secondary"
            disabled={loading}
            onClick={() => handleSave("draft")}
          >
            {loading ? "Saving..." : "Save draft"}
          </button>

          <button
            type="button"
            className="editor-button editor-primary"
            disabled={loading}
            onClick={() => handleSave("published")}
          >
            Publish
          </button>
        </div>
      </header>

      <div className="editor-heading">
        <span className="editor-eyebrow">
          YOUR WRITING WORKSPACE
        </span>

        <h1>{postId ? "Edit article" : "Write something."}</h1>

        <p>
          Share a project you built, a concept you learned, or a
          problem you solved.
        </p>
      </div>

      {error && (
        <div className="editor-error" role="alert">
          {error}
        </div>
      )}

      <div className="editor-toolbar">
        <span>ARTICLE CONTENT</span>

        <div className="editor-mode-switch">
          <button
            type="button"
            className={!preview ? "selected" : ""}
            onClick={() => setPreview(false)}
          >
            Write
          </button>

          <button
            type="button"
            className={preview ? "selected" : ""}
            onClick={() => setPreview(true)}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <section className="editor-main-panel">
          <label className="editor-field-label" htmlFor="post-title">
            Article title
          </label>

          <input
            id="post-title"
            className="editor-title-input"
            name="title"
            placeholder="Give your article a meaningful title..."
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
          />

          <label className="editor-field-label" htmlFor="post-slug">
            URL slug
          </label>

          <div className="editor-slug-input">
            <span>/blog/</span>

            <input
              id="post-slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(createSlug(event.target.value));
              }}
              placeholder="your-article-url"
            />
          </div>

          <p className="editor-markdown-help">
            Your URL will look like: /blog/{slug || "your-article-url"}
          </p>

          <label className="editor-field-label" htmlFor="post-excerpt">
            Short excerpt
          </label>

          <textarea
            id="post-excerpt"
            className="editor-excerpt-input"
            name="excerpt"
            rows={3}
            maxLength={240}
            placeholder="What will readers learn from this article?"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
          />

          {preview ? (
            <article className="editor-preview">
              <div className="editor-preview-meta">
                {readingTime} min read
              </div>

              <h2>{title || "Your article title"}</h2>

              {excerpt && (
                <p className="preview-excerpt">{excerpt}</p>
              )}

              {coverImage && (
                <img
                  className="editor-preview-cover"
                  src={coverImage}
                  alt="Article cover"
                />
              )}

              <div className="editor-markdown">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {content || "Your article content will appear here."}
                </ReactMarkdown>
              </div>
            </article>
          ) : (
            <>
              <div className="editor-content-label">
                <label
                  className="editor-field-label"
                  htmlFor="post-content"
                >
                  Article content
                </label>

                <span>Markdown supported</span>
              </div>

              <div className="editor-markdown-help">
                Use ## for headings, **bold** for emphasis, and
                triple backticks for code blocks.
              </div>

              <textarea
                id="post-content"
                className="editor-content-input"
                name="content"
                placeholder={
                  "## Introduction\n\nExplain what you built or learned...\n\n```javascript\nconsole.log('Hello, world!');\n```"
                }
                value={content}
                onChange={(event) => setContent(event.target.value)}
                spellCheck
              />

              <div className="editor-bottom-info">
                <span>{wordCount} words</span>
                <span>Approximately {readingTime} min read</span>
              </div>
            </>
          )}
        </section>

        <aside className="editor-settings">
          <section className="editor-setting-card">
            <h3>Publishing</h3>

            <label htmlFor="post-status">Status</label>

            <select
              id="post-status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <p>
              {status === "draft"
                ? "Only you should be able to access drafts."
                : "Ready to make this article available to readers."}
            </p>
          </section>

          <section className="editor-setting-card">
            <h3>Cover image</h3>

            {coverImage ? (
              <div className="editor-cover-preview">
                <img src={coverImage} alt="Selected cover" />

                <button
                  type="button"
                  onClick={handleRemoveCover}
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label className="editor-upload">
                <span className="editor-upload-icon">↑</span>
                <strong>Upload a cover</strong>
                <span>PNG, JPG or WebP · Max 5 MB</span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleCoverChange}
                />
              </label>
            )}
          </section>

          <section className="editor-setting-card">
            <h3>Article details</h3>

            <div className="editor-detail-row">
              <span>Reading time</span>
              <strong>{readingTime} min</strong>
            </div>

            <div className="editor-detail-row">
              <span>Word count</span>
              <strong>{wordCount}</strong>
            </div>
          </section>

          <button
            type="button"
            className="editor-button editor-primary editor-publish-wide"
            disabled={loading}
            onClick={() => handleSave(status)}
          >
            {loading
              ? "Saving..."
              : status === "published"
                ? "Publish article"
                : "Save draft"}
          </button>
        </aside>
      </div>
    </main>
  );
}

export default NewPost;
