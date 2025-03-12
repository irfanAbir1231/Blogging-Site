import { Grid, Container, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";

//components
import Banner from "../banner/Banner";
import Categories from "./Categories";
import Posts from "./post/Posts";
import ParallaxSection from "../animations/ParallaxSection";
import ScrollAnimation from "../animations/ScrollAnimation";
import HoverCard from "../animations/HoverCard";
import SearchBar from "./SearchBar";

const StyledContainer = styled(Container)`
  padding: 2rem 0;
`;

const ContentWrapper = styled(Box)`
  margin-top: 2rem;
`;

const SectionTitle = styled(Typography)`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: #1976d2;
    border-radius: 2px;
  }
`;

const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
    }}
  >
    <Typography>Loading...</Typography>
  </Box>
);

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (selectedPost) => {
    if (selectedPost) {
      navigate(`/details/${selectedPost._id}`);
    }
  };

  return (
    <Box>
      <ParallaxSection
        backgroundImage="/images/blog-banner.jpg"
        overlayColor="rgba(0,0,0,0.6)"
      >
        <ScrollAnimation direction="up" delay={0.2}>
          <Typography
            variant="h1"
            sx={{
              color: "white",
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              fontWeight: 700,
            }}
          >
            Welcome to BlogSpace
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              opacity: 0.9,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Discover amazing stories and share your thoughts
          </Typography>
        </ScrollAnimation>
      </ParallaxSection>

      <StyledContainer maxWidth="lg">
        <ContentWrapper>
          <ScrollAnimation direction="up" delay={0.4}>
            <SectionTitle variant="h2">Latest Posts</SectionTitle>
          </ScrollAnimation>

          <SearchBar onSearch={handleSearch} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={2}>
              <ScrollAnimation direction="right" delay={0.6}>
                <HoverCard>
                  <Categories />
                </HoverCard>
              </ScrollAnimation>
            </Grid>
            <Grid item xs={12} md={10}>
              <ScrollAnimation direction="left" delay={0.8}>
                <Suspense fallback={<LoadingFallback />}>
                  <Posts />
                </Suspense>
              </ScrollAnimation>
            </Grid>
          </Grid>
        </ContentWrapper>
      </StyledContainer>

      <ParallaxSection
        backgroundImage="/images/blog-footer.jpg"
        overlayColor="rgba(0,0,0,0.7)"
      >
        <ScrollAnimation direction="up" delay={0.2}>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              fontWeight: 600,
            }}
          >
            Join Our Community
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              opacity: 0.9,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Share your stories and connect with other writers
          </Typography>
        </ScrollAnimation>
      </ParallaxSection>
    </Box>
  );
};

export default Home;
