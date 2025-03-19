import { Grid, Box, Typography } from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";
import { API } from "../../../service/api";
import AnimatedPostCard from "./AnimatedPostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import { useInView } from "react-intersection-observer";

const POSTS_PER_PAGE = 9;

const LikedPosts = ({ username }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 100,
  });

  const fetchLikedPosts = useCallback(
    async (pageNum) => {
      if (!mountedRef.current || loadingRef.current || !username) return;

      try {
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        // Prepare query parameters
        const queryParams = {
          page: pageNum,
          limit: POSTS_PER_PAGE,
          likedBy: username, // This will filter posts that the user has liked
        };

        console.log("Fetching liked posts with params:", queryParams);
        const response = await API.getAllPosts(queryParams);
        console.log("API response for liked posts:", response);

        if (!mountedRef.current) return;

        if (response && response.isSuccess) {
          // Handle the response data
          const responseData = response.data || {};

          // Extract posts array with fallback to empty array
          let postsData = [];
          if (responseData.posts && Array.isArray(responseData.posts)) {
            postsData = responseData.posts;
          } else if (Array.isArray(responseData)) {
            postsData = responseData;
          }

          // Extract pagination data with fallbacks
          const paginationData = responseData.pagination || {};
          const totalPagesCount = paginationData.pages || 1;

          console.log("Processed liked posts data:", postsData);
          setTotalPages(totalPagesCount);

          if (pageNum === 1) {
            setPosts(postsData);
          } else {
            setPosts((prevPosts) => {
              // Ensure prevPosts is an array
              const prevPostsArray = Array.isArray(prevPosts) ? prevPosts : [];

              // Filter out duplicates
              const newPosts = postsData.filter(
                (newPost) =>
                  !prevPostsArray.some(
                    (existingPost) => existingPost._id === newPost._id
                  )
              );
              return [...prevPostsArray, ...newPosts];
            });
          }
          setHasMore(pageNum < totalPagesCount);
        } else {
          console.error("API response error:", response);
          setError(response?.msg || "Failed to load liked posts");
          setPosts([]);
          setHasMore(false);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        console.error("Error fetching liked posts:", err);
        setError(err?.msg || "Failed to load liked posts. Please try again later.");
        setPosts([]);
        setHasMore(false);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitialLoading(false);
          loadingRef.current = false;
        }
      }
    },
    [username]
  );

  // Initial fetch
  useEffect(() => {
    if (username) {
      setPage(1);
      setPosts([]);
      setHasMore(true);
      fetchLikedPosts(1);
    }
  }, [username, fetchLikedPosts]);

  // Handle infinite scroll
  useEffect(() => {
    const shouldLoadMore =
      inView && hasMore && !loadingRef.current && page < totalPages;

    if (shouldLoadMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLikedPosts(nextPage);
    }
  }, [inView, hasMore, page, totalPages, fetchLikedPosts]);

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

  // Ensure posts is always an array
  const safePosts = Array.isArray(posts) ? posts : [];

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
      {initialLoading ? (
        // Show skeleton loading for initial load
        renderSkeletons(4)
      ) : safePosts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No liked posts found
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {safePosts.map((post, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                key={`${post._id || index}-${Date.now()}-${index}`}
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

export default LikedPosts;
