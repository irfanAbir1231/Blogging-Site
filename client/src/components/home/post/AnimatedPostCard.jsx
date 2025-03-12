import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { DataContext } from "../../../context/DataProvider";

const AnimatedPostCard = ({ post }) => {
  const theme = useTheme();
  const { account } = useContext(DataContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  const fallbackImage =
    "https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80";

  useEffect(() => {
    // Reset states when post changes
    setImageLoaded(false);
    setImageError(false);

    // Set image source with proper handling
    if (post.picture) {
      // Clean up any existing cache busting parameters
      let baseUrl = post.picture;
      if (baseUrl.includes("?")) {
        baseUrl = baseUrl.split("?")[0];
      }
      setImageSrc(baseUrl);
    } else {
      setImageSrc(fallbackImage);
    }
  }, [post]);

  const handleImageError = () => {
    // If image fails to load, use fallback image
    setImageError(true);
    setImageSrc(fallbackImage);
  };

  const hasUpvoted = post.upvotes?.includes(account.username);
  const hasDownvoted = post.downvotes?.includes(account.username);
  const score = post.score || 0;

  return (
    <Link to={`/details/${post._id}`} style={{ textDecoration: "none" }}>
      <motion.div
        style={{
          background: theme.palette.background.paper,
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 6px rgba(255, 255, 255, 0.1)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "200px",
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "dark" ? "#2d2d2d" : "#f5f5f5",
          }}
        >
          <AnimatePresence>
            {!imageLoaded && !imageError && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: "100%", height: "100%" }}
              >
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{
                    bgcolor:
                      theme.palette.mode === "dark" ? "grey.800" : "grey.200",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.img
            src={imageSrc}
            alt={post.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imageLoaded ? 1 : 0,
            }}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
            crossOrigin="anonymous"
          />

          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)",
              opacity: 0,
              transition: "opacity 0.3s ease",
              "&:hover": {
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                {new Date(post.createdDate).toLocaleDateString()}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ThumbUp
                  fontSize="small"
                  color={hasUpvoted ? "primary" : "inherit"}
                  sx={{ opacity: 0.9 }}
                />
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  {score}
                </Typography>
                <ThumbDown
                  fontSize="small"
                  color={hasDownvoted ? "error" : "inherit"}
                  sx={{ opacity: 0.9 }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {post.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
              color: theme.palette.text.secondary,
            }}
          >
            {post.description}
          </Typography>
        </CardContent>
      </motion.div>
    </Link>
  );
};

export default AnimatedPostCard;
