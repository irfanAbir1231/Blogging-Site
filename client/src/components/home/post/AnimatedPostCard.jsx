import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useTheme,
  IconButton,
  Chip,
  Avatar,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { ThumbUp, ThumbDown, AccessTime, Person } from "@mui/icons-material";
import { DataContext } from "../../../context/DataProvider";
import { formatDistanceToNow } from "date-fns";
import { styled } from "@mui/material/styles";

const StyledCard = styled(motion.div)(({ theme }) => ({
  height: "100%",
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.2)"
      : "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : theme.palette.divider
  }`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.3)"
      : "0 8px 32px rgba(59, 130, 246, 0.15)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 40px rgba(0, 0, 0, 0.4)"
        : "0 20px 40px rgba(59, 130, 246, 0.25)",
  },
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: "linear-gradient(90deg, #0ea5e9, #3b82f6)",
    opacity: theme.palette.mode === "dark" ? 0.7 : 1,
    zIndex: 1,
  },
  maxWidth: "100%",
  display: "flex",
  flexDirection: "column",
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingTop: "45%", // Reduced from 56.25% for a shorter image
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.2)"
      : "rgba(255, 255, 255, 0.6)",
  overflow: "hidden",
  borderBottom: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.8)"
  }`,
}));

const StyledImage = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "scale(1.1)",
  },
});

// Category chip with glassy styling
const CategoryChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  fontWeight: 600,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.7)"
      : "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  color:
    theme.palette.mode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.main,
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(59, 130, 246, 0.3)"
      : "rgba(59, 130, 246, 0.2)"
  }`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
      : "0 4px 12px rgba(59, 130, 246, 0.15)",
  zIndex: 2,
}));

const MetaContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.2)"
      : "rgba(255, 255, 255, 0.7)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.7)"
  }`,
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.5), // Reduced from 0.75
  marginTop: theme.spacing(1.5), // Reduced from 2
  padding: theme.spacing(1), // Reduced from 1.5
  borderRadius: theme.spacing(1),
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.15)"
      : "rgba(255, 255, 255, 0.6)",
  backdropFilter: "blur(5px)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.7)"
  }`,
}));

const Tag = styled(Chip)(({ theme }) => ({
  height: 28,
  fontSize: "0.75rem",
  fontWeight: 500,
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.3)"
      : "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(59, 130, 246, 0.2)"
  }`,
  color:
    theme.palette.mode === "dark"
      ? theme.palette.text.secondary
      : theme.palette.text.primary,
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.4)"
        : "rgba(255, 255, 255, 0.9)",
  },
}));

const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2), // Reduced from 3
  display: "flex",
  flexDirection: "column",
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.1)"
      : "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(5px)",
  borderTop: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.8)"
  }`,
  transition: "background-color 0.3s ease",
  flex: 1,
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.15)"
        : "rgba(255, 255, 255, 0.8)",
  },
}));

const AuthorInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5), // Reduced from 2
  padding: theme.spacing(1), // Reduced from 1.5
  borderRadius: theme.spacing(1),
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.2)"
      : "rgba(255, 255, 255, 0.7)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.7)"
  }`,
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.25)"
        : "rgba(255, 255, 255, 0.8)",
  },
}));

const VoteContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.15)"
      : "rgba(255, 255, 255, 0.4)",
  backdropFilter: "blur(5px)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.7)"
  }`,
  marginTop: theme.spacing(2),
}));

const VoteButton = styled(IconButton)(({ theme, active: isActive }) => ({
  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
  transition: "all 0.2s ease",
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.2)"
      : "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(8px)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.8)"
  }`,
  padding: "6px",
  "&:hover": {
    transform: "scale(1.1)",
    color: isActive ? theme.palette.primary.dark : theme.palette.primary.light,
    background:
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.3)"
        : "rgba(255, 255, 255, 0.9)",
  },
}));

const AnimatedPostCard = ({ post }) => {
  const theme = useTheme();
  const { account } = useContext(DataContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  const fallbackImage =
    "https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80";

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setImageSrc(post.picture || fallbackImage);
  }, [post]);

  const handleImageError = () => {
    setImageError(true);
    setImageSrc(fallbackImage);
  };

  const hasUpvoted = post.upvotes?.includes(account.username);
  const hasDownvoted = post.downvotes?.includes(account.username);

  return (
    <Link to={`/details/${post._id}`} style={{ textDecoration: "none" }}>
      <StyledCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ImageContainer>
          {!imageLoaded && !imageError && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          )}
          <StyledImage
            src={imageSrc}
            alt={post.title}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
            crossOrigin="anonymous"
          />
          {post.tags && post.tags.length > 0 ? (
            <CategoryChip label={post.tags[0]} size="small" />
          ) : post.categories ? (
            <CategoryChip label={post.categories} size="small" />
          ) : null}
        </ImageContainer>

        <ContentContainer>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem", // Reduced from 1.25rem
              display: "-webkit-box",
              WebkitLineClamp: 1, // Reduced from 2
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              mb: 1, // Reduced from 2
              color: theme.palette.mode === "dark" ? "#fff" : "#1a1a1a",
            }}
          >
            {post.title}
          </Typography>

          <Typography
            variant="body2" // Changed from body1
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2, // Reduced from 3
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5, // Reduced from 1.6
              mb: 1.5, // Reduced from 2
              fontSize: "0.875rem", // Reduced from 0.95rem
            }}
          >
            {post.description}
          </Typography>

          <AuthorInfo>
            <Avatar
              src={post.userPicture || null}
              alt={post.username}
              sx={{
                width: 28, // Reduced from 32
                height: 28, // Reduced from 32
                bgcolor: theme.palette.primary.main,
              }}
            >
              {post.username ? post.username[0].toUpperCase() : "U"}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.8rem", // Added to make it smaller
                  color: theme.palette.mode === "dark" ? "#fff" : "#1a1a1a",
                }}
              >
                {post.username}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.7rem", // Added to make it smaller
                }}
              >
                <AccessTime sx={{ fontSize: 12 }} /> {/* Reduced from 14 */}
                {formatDistanceToNow(new Date(post.createdDate), {
                  addSuffix: true,
                })}
              </Typography>
            </Box>
          </AuthorInfo>

          {(post.tags && post.tags.length > 0) || post.categories ? (
            <TagsContainer>
              {post.tags ? (
                post.tags.slice(0, 3).map(
                  (
                    tag // Limited to first 3 tags
                  ) => <Tag key={tag} label={tag} size="small" />
                )
              ) : (
                <Tag label={post.categories} size="small" />
              )}
            </TagsContainer>
          ) : null}
        </ContentContainer>

        <MetaContainer sx={{ mt: 0, borderTop: 1, borderColor: "divider" }}>
          {" "}
          {/* Added border and removed margin */}
          <VoteContainer sx={{ mt: 0 }}>
            {" "}
            {/* Removed margin */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <VoteButton
                size="small"
                sx={{ color: hasUpvoted ? "primary.main" : "text.secondary" }}
                onClick={(e) => {
                  e.preventDefault();
                  // Handle upvote
                }}
              >
                <ThumbUp fontSize="small" />
              </VoteButton>
              <Typography
                variant="body2"
                sx={{ minWidth: 20, textAlign: "center" }}
              >
                {post.upvotes?.length || 0}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <VoteButton
                size="small"
                sx={{ color: hasDownvoted ? "error.main" : "text.secondary" }}
                onClick={(e) => {
                  e.preventDefault();
                  // Handle downvote
                }}
              >
                <ThumbDown fontSize="small" />
              </VoteButton>
              <Typography
                variant="body2"
                sx={{ minWidth: 20, textAlign: "center" }}
              >
                {post.downvotes?.length || 0}
              </Typography>
            </Box>
          </VoteContainer>
        </MetaContainer>
      </StyledCard>
    </Link>
  );
};

export default AnimatedPostCard;
