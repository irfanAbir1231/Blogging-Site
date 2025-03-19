import { Card, Box, Skeleton } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  position: "relative",
  background: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  transform: "translateY(0)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(59, 130, 246, 0.15)',
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    transform: "translateX(-100%)",
    backgroundImage: `linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      ${
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(255, 255, 255, 0.2)"
      } 20%,
      ${
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(255, 255, 255, 0.5)"
      } 60%,
      rgba(255, 255, 255, 0)
    )`,
    animation: `${shimmer} 2s infinite linear`,
    backgroundSize: "200% 100%",
    backgroundRepeat: "no-repeat",
    pointerEvents: "none",
  },
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

const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.08)",
  "&::after": {
    background: `linear-gradient(90deg, transparent, ${
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.04)"
    }, transparent)`,
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingTop: "60%", // 5:3 aspect ratio
  width: "100%",
  overflow: "hidden",
}));

const PostCardSkeleton = () => {
  return (
    <StyledCard elevation={2}>
      <ImageContainer>
        <StyledSkeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      </ImageContainer>

      <Box sx={{ p: 2 }}>
        {/* Title placeholder */}
        <StyledSkeleton
          variant="text"
          width="80%"
          height={32}
          animation="wave"
          sx={{ mb: 1 }}
        />

        {/* Description placeholder */}
        <StyledSkeleton
          variant="text"
          width="100%"
          animation="wave"
          sx={{ mb: 0.5 }}
        />
        <StyledSkeleton
          variant="text"
          width="90%"
          animation="wave"
          sx={{ mb: 0.5 }}
        />
        <StyledSkeleton variant="text" width="60%" animation="wave" />

        {/* Meta info placeholder */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <StyledSkeleton
              variant="circular"
              width={24}
              height={24}
              animation="wave"
            />
            <StyledSkeleton
              variant="text"
              width={80}
              animation="wave"
              sx={{ my: 0 }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <StyledSkeleton
              variant="circular"
              width={24}
              height={24}
              animation="wave"
            />
            <StyledSkeleton
              variant="text"
              width={40}
              animation="wave"
              sx={{ my: 0 }}
            />
          </Box>
        </Box>
      </Box>
    </StyledCard>
  );
};

export default PostCardSkeleton;
