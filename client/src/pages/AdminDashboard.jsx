import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";
import api from "../api/axios";
import "./AdminDashboard.css";

const PAGE_SIZE = 10;

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function formatViews(post) {
  const views = Number(post.viewCount ?? post.views ?? 0);
  return (Number.isFinite(views) ? views : 0).toLocaleString();
}

function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const params = { page, limit: PAGE_SIZE };
        if (filter !== "all") params.status = filter;
        if (search.trim()) params.search = search.trim();

        const [postsResponse, publishedResponse, draftResponse] =
          await Promise.all([
            api.get("/posts/admin/all", { params }),
            api.get("/posts/admin/all", {
              params: { status: "published", page: 1, limit: 1 },
            }),
            api.get("/posts/admin/all", {
              params: { status: "draft", page: 1, limit: 1 },
            }),
          ]);

        if (!Array.isArray(postsResponse.data.posts)) {
          throw new Error("The server returned an invalid article list.");
        }

        if (cancelled) return;

        setPosts(postsResponse.data.posts);
        setPagination(
          postsResponse.data.pagination || {
            page,
            total: postsResponse.data.posts.length,
            totalPages: 1,
          },
        );
        setPublishedCount(publishedResponse.data.pagination?.total ?? 0);
        setDraftCount(draftResponse.data.pagination?.total ?? 0);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load articles. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [filter, page, reloadKey, search]);

  const totalViews = useMemo(
    () => posts.reduce((total, post) => total + (Number(post.viewCount ?? post.views) || 0), 0),
    [posts],
  );

  async function deletePost(post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      return;
    }

    setActionError("");
    setDeletingId(post._id);

    try {
      await api.delete(`/posts/${post._id}`);

      if (posts.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        setReloadKey((currentKey) => currentKey + 1);
      }
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to delete this article. Please try again.",
      );
    } finally {
      setDeletingId("");
    }
  }

  function changeFilter(nextFilter) {
    setPage(1);
    setFilter(nextFilter);
  }

  function changeSearch(event) {
    setPage(1);
    setSearch(event.target.value);
  }

  const totalArticles = publishedCount + draftCount;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          siva<span>.</span>
          <small>STUDIO</small>
        </Link>

        <div className="admin-sidebar-label">WORKSPACE</div>

        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link active">
            <span>▦</span> Dashboard
          </Link>

          <a
            href="#posts"
            className="admin-nav-link"
            onClick={() => changeFilter("all")}
          >
            <span>▤</span> All posts
          </a>

          <button
            className="admin-nav-link"
            onClick={() => changeFilter("draft")}
          >
            <span>◷</span> Drafts
          </button>

          <Link to="/" className="admin-nav-link">
            <span>↗</span> View website
          </Link>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile-avatar">S</div>
          <div>
            <strong>Siva</strong>
            <span>Blog administrator</span>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-breadcrumb">Workspace / Dashboard</span>
            <h1>Dashboard</h1>
          </div>

          <div className="admin-top-actions">
            <ThemeToggle />
            <Link to="/admin/new" className="admin-create-btn">
              <span>+</span> New post
            </Link>
          </div>
        </header>

        <section className="admin-welcome">
          <div>
            <h2>Your writing workspace.</h2>
            <p>
              Manage your articles and keep track of your developer journey.
            </p>
          </div>

          <span className="admin-welcome-icon">✳</span>
        </section>

        <section className="admin-stats" aria-label="Article statistics">
          <article className="admin-stat-card">
            <span>Total articles</span>
            <strong>{loading && !totalArticles ? "—" : totalArticles}</strong>
            <small>Across all statuses</small>
          </article>

          <article className="admin-stat-card">
            <span>Published</span>
            <strong>{publishedCount}</strong>
            <small>Visible on your website</small>
          </article>

          <article className="admin-stat-card">
            <span>Drafts</span>
            <strong>{draftCount}</strong>
            <small>Not yet published</small>
          </article>

          <article className="admin-stat-card">
            <span>Views on this page</span>
            <strong>{totalViews.toLocaleString()}</strong>
            <small>Across the articles shown</small>
          </article>
        </section>

        <section className="admin-posts-panel" id="posts">
          <div className="admin-posts-heading">
            <div>
              <h2>Your articles</h2>
              <p>Manage your published writing and drafts.</p>
            </div>
          </div>

          <div className="admin-toolbar">
            <div className="admin-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={changeSearch}
                aria-label="Search articles"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => changeFilter(event.target.value)}
              aria-label="Filter by status"
              className="admin-filter"
            >
              <option value="all">All posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {actionError && (
            <p className="admin-notice admin-notice-error" role="alert">
              {actionError}
            </p>
          )}

          {error && (
            <div className="admin-notice admin-notice-error" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setReloadKey((currentKey) => currentKey + 1)}
              >
                Retry
              </button>
            </div>
          )}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ARTICLE</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>VIEWS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="admin-empty" role="status">
                      Loading articles...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      Articles could not be loaded.
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      {search.trim()
                        ? "No articles match your search."
                        : filter !== "all"
                          ? `No ${filter} articles yet.`
                          : "No articles yet. Create your first post to get started."}
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <div className="admin-post-title">{post.title}</div>
                        <div className="admin-post-slug">/blog/{post.slug}</div>
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            post.status === "published" ? "published" : "draft"
                          }`}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td>{formatDate(post.publishedAt || post.createdAt)}</td>
                      <td>{formatViews(post)}</td>

                      <td>
                        <div className="admin-actions">
                          <Link
                            to={`/admin/edit/${encodeURIComponent(post.slug)}`}
                            className="admin-edit-btn"
                          >
                            Edit
                          </Link>

                          <button
                            className="admin-delete-btn"
                            onClick={() => deletePost(post)}
                            aria-label={`Delete ${post.title}`}
                            disabled={Boolean(deletingId)}
                          >
                            {deletingId === post._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            <span>
              {loading
                ? "Loading article list..."
                : `Showing ${posts.length} of ${pagination.total} articles`}
            </span>
            <div className="admin-pagination" aria-label="Article pages">
              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={loading || page <= 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {Math.max(1, pagination.totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={
                  loading || page >= Math.max(1, pagination.totalPages)
                }
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
