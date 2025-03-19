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
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(59, 130, 246, 0.15)',
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 20px 40px rgba(0, 0, 0, 0.4)' 
      : '0 20px 40px rgba(59, 130, 246, 0.2)',
  },
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, #0ea5e9, #3b82f6)',
    opacity: theme.palette.mode === 'dark' ? 0.7 : 1,
    zIndex: 1,
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingTop: "50%", // 2:1 aspect ratio (reduced from 56.25%)
  backgroundColor: theme.palette.mode === "dark"
    ? "rgba(0, 0, 0, 0.2)"
    : "rgba(255, 255, 255, 0.6)",
  overflow: "hidden",
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'}`,
}));

const StyledImage = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

// Category chip with glassy styling
const CategoryChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  fontWeight: 500,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.5)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  color: theme.palette.mode === 'dark' 
    ? theme.palette.primary.light 
    : theme.palette.primary.main,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
    : '0 4px 12px rgba(59, 130, 246, 0.15)',
}));

const MetaContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.5)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'}`,
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.15)' 
    : 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(5px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'}`,
}));

const Tag = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.7rem',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.2)'}`,
  color: theme.palette.mode === 'dark' 
    ? theme.palette.text.secondary 
    : theme.palette.text.primary,
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.4)' 
      : 'rgba(255, 255, 255, 0.9)',
  },
}));

const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.1)' 
    : 'rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(5px)',
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'}`,
  transition: 'background-color 0.3s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.15)' 
      : 'rgba(255, 255, 255, 0.6)',
  },
}));

const AuthorInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.5)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'}`,
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.25)' 
      : 'rgba(255, 255, 255, 0.6)',
  },
}));

const VoteContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.15)' 
    : 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(5px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'}`,
  marginTop: theme.spacing(2),
}));

const VoteButton = styled(IconButton)(({ theme, active: isActive }) => ({
  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
  transition: "all 0.2s ease",
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'}`,
  padding: '6px',
  "&:hover": {
    transform: "scale(1.1)",
    color: isActive ? theme.palette.primary.dark : theme.palette.primary.light,
    background: theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(255, 255, 255, 0.9)',
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
              fontWeight: 600,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              mb: 1,
            }}
          >
            {post.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.6,
            }}
          >
            {post.description}
          </Typography>

          {post.tags && post.tags.length > 0 ? (
            <TagsContainer>
              {post.tags.map((tag) => (
                <Tag key={tag} label={tag} size="small" />
              ))}
            </TagsContainer>
          ) : post.categories ? (
            <TagsContainer>
              <Tag label={post.categories} size="small" />
            </TagsContainer>
          ) : null}
        </ContentContainer>

        <MetaContainer>
          <AuthorInfo>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {post.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {post.username}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <AccessTime fontSize="small" />
                {formatDistanceToNow(new Date(post.createdDate), {
                  addSuffix: true,
                })}
              </Typography>
            </Box>
          </AuthorInfo>

          <VoteContainer>
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
