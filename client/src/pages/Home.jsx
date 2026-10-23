import { useCallback, useEffect, useRef, useState } from "react";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero.jsx";
import Navbar from "../components/Navbar.jsx";
import PostList from "../components/PostList.jsx";
import FeaturedPost from "../components/FeaturedPost.jsx";
import api from "../api/axios.js";
import "../styles/home.css";

const POSTS_PER_PAGE = 10;

function Home() {
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchFirstPage() {
      setLoading(true);
      setError("");
      setPosts([]);
      setTotalCount(0);
      setPage(1);

      try {
        const { data } = await api.get("/posts", {
          params: { page: 1, limit: POSTS_PER_PAGE },
        });

        if (!cancelled) {
          setPosts(data.posts || []);
          setTotalCount(data.pagination?.total ?? data.posts?.length ?? 0);
          setHasMore(
            (data.pagination?.page || 1) <
              (data.pagination?.totalPages || 1),
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load articles. Please try again later.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFirstPage();

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const { data } = await api.get("/posts", {
        params: { page: nextPage, limit: POSTS_PER_PAGE },
      });

      setPosts((currentPosts) => [...currentPosts, ...(data.posts || [])]);
      setPage(data.pagination?.page || nextPage);
      setHasMore(
        (data.pagination?.page || nextPage) <
          (data.pagination?.totalPages || nextPage),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load more articles. Please try again.",
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, page]);

  const featuredPost = posts[0];

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="content-wrap">
          {featuredPost && (
            <>
              <div className="feature-heading">
                <span>01</span>
                <span>Editor's pick</span>
                <span className="heading-rule" />
              </div>
              <FeaturedPost post={featuredPost} />
            </>
          )}
          <PostList
            posts={featuredPost ? posts.slice(1) : posts}
            totalCount={totalCount}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            error={error}
            onLoadMore={loadMore}
            onRetry={() => {
              if (posts.length) {
                loadMore();
              } else {
                setRetryKey((currentKey) => currentKey + 1);
              }
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Home;
