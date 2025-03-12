import { Grid, Box, Typography } from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";
import { API } from "../../../service/api";
import AnimatedPostCard from "./AnimatedPostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { useInView } from "react-intersection-observer";
import { useLocation } from "react-router-dom";

const POSTS_PER_PAGE = 9;
const INITIAL_SKELETON_COUNT = 6;

const Posts = () => {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 100,
  });

  // Update selected category when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "";
    if (selectedCategory !== category) {
      setSelectedCategory(category);
      setInitialLoading(true); // Reset loading state when category changes
    }
  }, [location.search]);

  const fetchPosts = useCallback(
    async (pageNum) => {
      if (!mountedRef.current || loadingRef.current) return;

      try {
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        // Add artificial delay for smoother loading experience
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Only include category in the query if it's not empty
        const queryParams = {
          page: pageNum,
          limit: POSTS_PER_PAGE,
        };
        if (selectedCategory) {
          queryParams.category = selectedCategory;
        }

        const response = await API.getAllPosts(queryParams);

        if (!mountedRef.current) return;

        if (response.isSuccess) {
          const { data, totalPages: total } = response.data;
          setTotalPages(total);

          if (pageNum === 1) {
            setPosts(data);
          } else {
            setPosts((prevPosts) => {
              const newPosts = data.filter(
                (newPost) =>
                  !prevPosts.some(
                    (existingPost) => existingPost._id === newPost._id
                  )
              );
              return [...prevPosts, ...newPosts];
            });
          }
          setHasMore(pageNum < total);
        } else {
          setError(response.msg || "No posts found");
          setHasMore(false);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        console.error("Error fetching posts:", err);
        setError(err.msg || "Failed to load posts. Please try again later.");
        setHasMore(false);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitialLoading(false);
          loadingRef.current = false;
        }
      }
    },
    [selectedCategory]
  );

  // Initial fetch
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1);
  }, [selectedCategory, fetchPosts]);

  // Handle infinite scroll
  useEffect(() => {
    const shouldLoadMore =
      inView && hasMore && !loadingRef.current && page < totalPages;

    if (shouldLoadMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [inView, hasMore, page, totalPages, fetchPosts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Render loading skeletons
  const renderSkeletons = (count) => (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} key={`skeleton-${index}`}>
          <PostCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {selectedCategory && (
        <Typography variant="h6" sx={{ mb: 3 }}>
          Showing posts in {selectedCategory}
        </Typography>
      )}

      {initialLoading ? (
        // Show skeleton loading for initial load
        renderSkeletons(4)
      ) : (
        <>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid
                item
                xs={12}
                sm={6}
                key={`${post._id}-${post.createdDate}`}
                sx={{ minHeight: 600 }}
              >
                <AnimatedPostCard post={post} />
              </Grid>
            ))}
          </Grid>

          {/* Loading indicator for infinite scroll */}
          {hasMore && (
            <Box
              ref={ref}
              sx={{
                py: 4,
                width: "100%",
              }}
            >
              {loading && renderSkeletons(2)}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Posts;
