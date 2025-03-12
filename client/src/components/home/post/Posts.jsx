import { Grid, Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";
import { API } from "../../../service/api";
import AnimatedPostCard from "./AnimatedPostCard";
import { useInView } from "react-intersection-observer";
import { useLocation, useNavigate } from "react-router-dom";

const POSTS_PER_PAGE = 9;

const Posts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
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
    }
  }, [location.search]);

  const fetchPosts = useCallback(
    async (pageNum) => {
      if (!mountedRef.current || loadingRef.current) return;

      try {
        loadingRef.current = true;
        setLoading(true);
        setError(null);

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
          loadingRef.current = false;
        }
      }
    },
    [selectedCategory]
  );

  // Reset page when category changes
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

  return (
    <Box>
      {error ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      ) : !posts.length && !loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No posts available {selectedCategory && `in ${selectedCategory}`}
          </Typography>
        </Box>
      ) : (
        <>
          {selectedCategory && (
            <Typography variant="h6" sx={{ mb: 3 }}>
              Showing posts in {selectedCategory}
            </Typography>
          )}
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={`${post._id}-${post.createdDate}`}
              >
                <AnimatedPostCard post={post} />
              </Grid>
            ))}
          </Grid>

          <Box
            ref={ref}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
              visibility: hasMore ? "visible" : "hidden",
            }}
          >
            {loading && <CircularProgress />}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Posts;
