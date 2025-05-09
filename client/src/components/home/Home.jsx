import {
  Grid,
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Suspense, lazy, useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { API } from "../../service/api";

//components
import Banner from "../banner/Banner";
import PostsList from "./post/PostsList";
import ParallaxSection from "../animations/ParallaxSection";
import ScrollAnimation from "../animations/ScrollAnimation";
import HoverCard from "../animations/HoverCard";
import SearchBar from "./SearchBar";
import AIRecommendations from "./recommendations/AIRecommendations";
import { DataContext } from "../../context/DataProvider";

// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ExploreIcon from "@mui/icons-material/Explore";

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(6, 0),
  position: "relative",
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  marginTop: theme.spacing(8),
  zIndex: 1,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(5),
  position: "relative",
  fontWeight: 800,
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -12,
    left: "50%",
    transform: "translateX(-50%)",
    width: 80,
    height: 4,
    background: theme.palette.primary.main,
    borderRadius: 2,
  },
}));

const CreateButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: "14px 32px",
  fontSize: "1.1rem",
  fontWeight: 600,
  borderRadius: "30px",
  textTransform: "none",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  background: theme.palette.primary.main,
  "&:hover": {
    background: theme.palette.primary.dark,
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.25)",
    transform: "translateY(-3px)",
  },
  "&:active": {
    transform: "translateY(1px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3), rgba(255,255,255,0) 70%)",
    transform: "translateX(-100%)",
    transition: "all 0.6s ease",
  },
  "&:hover::after": {
    transform: "translateX(100%)",
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  borderRadius: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  transition: "all 0.3s ease",
  border: "1px solid",
  borderColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : theme.palette.divider,
  position: "relative",
  overflow: "hidden",
  background:
    theme.palette.mode === "dark"
      ? "rgba(0, 0, 0, 0.2)"
      : "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 30px rgba(0, 0, 0, 0.3)"
        : "0 20px 30px rgba(0, 0, 0, 0.1)",
    "& .icon-wrapper": {
      transform: "translateY(-5px) rotateY(15deg) rotateX(15deg) translateZ(0)",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 15px 30px rgba(14, 165, 233, 0.3)"
          : "0 15px 30px rgba(59, 130, 246, 0.4)",
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "5px",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(90deg, #0ea5e9, #3b82f6)"
        : "linear-gradient(90deg, #0ea5e9, #3b82f6)",
    opacity: theme.palette.mode === "dark" ? 0.7 : 1,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "70px",
  height: "70px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  background:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(15px)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(255, 255, 255, 0.8)"
  }`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.3)"
      : "0 8px 32px rgba(59, 130, 246, 0.2)",
  position: "relative",
  overflow: "hidden",
  transform: "translateZ(0)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(59, 130, 246, 0.2))"
        : "linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(59, 130, 246, 0.4))",
    opacity: 0.6,
    zIndex: -1,
  },
  "&:hover": {
    transform: "translateY(-5px) rotateY(10deg) rotateX(10deg) translateZ(0)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 15px 35px rgba(14, 165, 233, 0.3)"
        : "0 15px 35px rgba(59, 130, 246, 0.3)",
  },
  animation: "float 6s ease-in-out infinite",
  "@keyframes float": {
    "0%, 100%": {
      transform: "translateY(0) rotateY(0) rotateX(0) translateZ(0)",
    },
    "50%": {
      transform: "translateY(-7px) rotateY(5deg) rotateX(5deg) translateZ(0)",
    },
  },
}));

const SectionDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(8, 0),
  "&::before, &::after": {
    borderColor: theme.palette.divider,
  },
}));

const FeaturedChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: -12,
  left: 24,
  fontWeight: 600,
  zIndex: 2,
}));

const BackgroundDecoration = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  overflow: "hidden",
  zIndex: 0,
  opacity: 0.05,
  pointerEvents: "none",
  "&::before": {
    content: '""',
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: theme.palette.primary.main,
    top: -200,
    right: -200,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: theme.palette.secondary.main,
    bottom: -100,
    left: -100,
  },
}));

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

// Tab Panel Component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: "90vh",
  display: "flex",
  alignItems: "center",
  position: "relative",
  background: "linear-gradient(135deg, #0369a1 0%, #2563eb 50%, #1e40af 100%)",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "10%",
    left: "5%",
    width: "45%",
    height: "45%",
    background:
      "radial-gradient(circle, rgba(96,165,250,0.4) 0%, rgba(59,130,246,0.2) 50%, rgba(0,0,0,0) 100%)",
    filter: "blur(80px)",
    borderRadius: "50%",
    animation: "pulse 15s ease-in-out infinite",
    mixBlendMode: "soft-light",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "15%",
    right: "10%",
    width: "40%",
    height: "40%",
    background:
      "radial-gradient(circle, rgba(224,242,254,0.4) 0%, rgba(186,230,253,0.2) 50%, rgba(0,0,0,0) 100%)",
    filter: "blur(80px)",
    borderRadius: "50%",
    animation: "pulse 12s ease-in-out infinite 2s",
    mixBlendMode: "soft-light",
  },
  "@keyframes pulse": {
    "0%, 100%": {
      transform: "scale(1)",
      opacity: 0.6,
    },
    "50%": {
      transform: "scale(1.1)",
      opacity: 0.8,
    },
  },
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  color: "#fff",
  textShadow: "0 0 20px rgba(224,242,254,0.6), 0 0 40px rgba(96,165,250,0.4)",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, rgba(224,242,254,0.2), rgba(96,165,250,0.2))",
    filter: "blur(50px)",
    opacity: 0.6,
    zIndex: -1,
    animation: "glow 3s ease-in-out infinite",
  },
  "@keyframes glow": {
    "0%, 100%": {
      opacity: 0.6,
    },
    "50%": {
      opacity: 0.8,
    },
  },
}));

const HeroButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(90deg, #0284c7 0%, #1d4ed8 100%)",
  color: "white",
  borderRadius: "30px",
  padding: "12px 32px",
  fontSize: "1.1rem",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 10px 20px rgba(2, 132, 199, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(90deg, #0369a1 0%, #1e40af 100%)",
    boxShadow: "0 15px 25px rgba(2, 132, 199, 0.4)",
    transform: "translateY(-2px)",
  },
}));

const FloatingImage = styled("img")(({ theme }) => ({
  maxWidth: "100%",
  height: "auto",
  animation: "float 6s ease-in-out infinite",
  "@keyframes float": {
    "0%, 100%": {
      transform: "translateY(0) rotate(0deg)",
    },
    "50%": {
      transform: "translateY(-20px) rotate(2deg)",
    },
  },
}));

const Home = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const { account } = useContext(DataContext);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("accessToken")
  );
  const postsRef = useRef(null);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loadingFeaturedPost, setLoadingFeaturedPost] = useState(true);

  // Fetch the most liked post to use as featured content
  useEffect(() => {
    const fetchMostLikedPost = async () => {
      try {
        setLoadingFeaturedPost(true);
        // Get all posts first
        const response = await API.getAllPosts({});
        if (response && response.isSuccess) {
          const posts = response.data.posts || response.data;
          if (posts && posts.length > 0) {
            // Sort posts by upvotes count in descending order
            const sortedPosts = [...posts].sort((a, b) => {
              const aUpvotes = a.upvotes?.length || 0;
              const bUpvotes = b.upvotes?.length || 0;
              return bUpvotes - aUpvotes;
            });

            // Set the post with the most upvotes as featured
            if (sortedPosts.length > 0) {
              setFeaturedPost(sortedPosts[0]);
              console.log(
                "Most liked post:",
                sortedPosts[0].title,
                "with",
                sortedPosts[0].upvotes?.length || 0,
                "upvotes"
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching featured post:", error);
      } finally {
        setLoadingFeaturedPost(false);
      }
    };

    fetchMostLikedPost();
  }, []);

  // Check authentication status when account changes
  useEffect(() => {
    setIsAuthenticated(!!sessionStorage.getItem("accessToken"));
  }, [account]);

  const handleSearch = (selectedPost) => {
    if (selectedPost) {
      navigate(`/details/${selectedPost._id}`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ overflow: "hidden" }}>
      <HeroSection>
        <Container maxWidth="lg">
          <Grid
            container
            spacing={4}
            alignItems="center"
            sx={{ minHeight: "80vh" }}
          >
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <GlowingText
                  variant="h1"
                  sx={{
                    mb: 3,
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                    lineHeight: 1.2,
                  }}
                >
                  Write, Share, Connect
                </GlowingText>
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    mb: 4,
                    maxWidth: "600px",
                    lineHeight: 1.6,
                  }}
                >
                  Your words have the power to inspire, inform, and transform.
                  Join our community of passionate bloggers and let your voice
                  be heard.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <HeroButton
                    onClick={() => navigate("/create")}
                    startIcon={<AutoAwesomeIcon />}
                  >
                    Get started
                  </HeroButton>
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "white",
                      borderRadius: "30px",
                      padding: "12px 32px",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "white",
                        background: "rgba(255,255,255,0.1)",
                        boxShadow: "0 10px 20px rgba(2, 132, 199, 0.2)",
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => {
                      postsRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Explore
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "140%",
                    height: "140%",
                    background:
                      "radial-gradient(circle, rgba(186,230,253,0.5) 0%, rgba(147,197,253,0.3) 60%, rgba(0,0,0,0) 100%)",
                    filter: "blur(80px)",
                    zIndex: 0,
                    animation: "breathe 10s ease-in-out infinite",
                    mixBlendMode: "soft-light",
                  },
                }}
              >
                <FloatingImage
                  src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80"
                  alt="Person Writing in Notebook"
                  loading="lazy"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                    transform: "scale(1)",
                    transition: "transform 0.5s ease",
                    borderRadius: "12px",
                    filter: "drop-shadow(0 20px 30px rgba(14,165,233,0.3))",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <StyledContainer maxWidth="lg">
        <BackgroundDecoration />
        <ContentWrapper>
          <ScrollAnimation direction="up" delay={0.4}>
            {isAuthenticated && account.username ? (
              <Paper sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab
                    icon={<ExploreIcon />}
                    label="Explore"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<SmartToyIcon />}
                    label="AI Recommendations"
                    iconPosition="start"
                  />
                </Tabs>
              </Paper>
            ) : (
              <SectionTitle variant="h2">Explore Our Latest Posts</SectionTitle>
            )}
          </ScrollAnimation>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={9}>
                <SearchBar onSearch={handleSearch} />
              </Grid>
              <Grid
                item
                xs={12}
                md={3}
                sx={{
                  textAlign: { xs: "center", md: "right" },
                  mt: { xs: 2, md: 0 },
                }}
              >
                <CreateButton
                  variant="contained"
                  onClick={() => navigate("/create")}
                  startIcon={<AutoAwesomeIcon />}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  Create Blog
                </CreateButton>
              </Grid>
            </Grid>
          </Box>

          {isAuthenticated && account.username ? (
            <>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={4} sx={{ mt: 4 }}>
                  <Grid item xs={12}>
                    <ScrollAnimation direction="up" delay={0.6}>
                      <Box sx={{ position: "relative", mb: 6, mt: 2 }}>
                        <FeaturedChip
                          label="Featured Content"
                          color="primary"
                          icon={<WhatshotIcon />}
                        />
                        {loadingFeaturedPost ? (
                          <LoadingFallback />
                        ) : featuredPost ? (
                          <Paper
                            elevation={3}
                            sx={{
                              borderRadius: 4,
                              overflow: "hidden",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Grid container>
                              <Grid item xs={12} md={6}>
                                <Box
                                  sx={{
                                    height: { xs: 200, md: "100%" },
                                    backgroundImage: featuredPost.picture
                                      ? `url(${featuredPost.picture})`
                                      : "url(https://source.unsplash.com/random/600x400/?health)",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Box sx={{ p: 4 }}>
                                  <Typography
                                    variant="overline"
                                    color="primary.main"
                                    fontWeight={600}
                                  >
                                    MOST LIKED POST
                                  </Typography>
                                  <Typography
                                    variant="h4"
                                    sx={{ mt: 1, mb: 2, fontWeight: 700 }}
                                  >
                                    {featuredPost.title}
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mb: 3 }}
                                  >
                                    {featuredPost.description.length > 150
                                      ? `${featuredPost.description.substring(
                                          0,
                                          150
                                        )}...`
                                      : featuredPost.description}
                                  </Typography>
                                  <Button
                                    variant="outlined"
                                    onClick={() =>
                                      navigate(`/details/${featuredPost._id}`)
                                    }
                                    sx={{
                                      borderRadius: 8,
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Read Article
                                  </Button>
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                        ) : (
                          <Paper
                            elevation={3}
                            sx={{
                              borderRadius: 4,
                              overflow: "hidden",
                              border: "1px solid",
                              borderColor: "divider",
                              p: 4,
                              textAlign: "center",
                            }}
                          >
                            <Typography variant="h6">
                              No featured content available at the moment
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    </ScrollAnimation>
                  </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ mb: 6 }}>
                  <Grid item xs={12} md={4}>
                    <ScrollAnimation direction="up" delay={0.2}>
                      <FeatureCard>
                        <IconWrapper className="icon-wrapper">
                          <TrendingUpIcon
                            sx={{
                              fontSize: 32,
                              color: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(59, 130, 246, 0.9)"
                                  : "rgba(14, 165, 233, 0.9)",
                            }}
                          />
                        </IconWrapper>
                        <Typography
                          variant="h6"
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          Trending Topics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Stay updated with the most popular health discussions
                          and breakthroughs happening right now.
                        </Typography>
                      </FeatureCard>
                    </ScrollAnimation>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ScrollAnimation direction="up" delay={0.4}>
                      <FeatureCard>
                        <IconWrapper className="icon-wrapper">
                          <WhatshotIcon
                            sx={{
                              fontSize: 32,
                              color: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(239, 68, 68, 0.9)"
                                  : "rgba(220, 38, 38, 0.9)",
                            }}
                          />
                        </IconWrapper>
                        <Typography
                          variant="h6"
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          Hot Discussions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Join vibrant conversations about health topics that
                          matter to you and connect with like-minded
                          individuals.
                        </Typography>
                      </FeatureCard>
                    </ScrollAnimation>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ScrollAnimation direction="up" delay={0.6}>
                      <FeatureCard>
                        <IconWrapper className="icon-wrapper">
                          <AutoAwesomeIcon
                            sx={{
                              fontSize: 32,
                              color: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(234, 179, 8, 0.9)"
                                  : "rgba(202, 138, 4, 0.9)",
                            }}
                          />
                        </IconWrapper>
                        <Typography
                          variant="h6"
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          Expert Insights
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Learn from healthcare professionals and thought
                          leaders sharing their knowledge and experiences.
                        </Typography>
                      </FeatureCard>
                    </ScrollAnimation>
                  </Grid>
                </Grid>

                <SectionDivider>
                  <Chip label="LATEST POSTS" />
                </SectionDivider>

                <Grid container spacing={4} ref={postsRef}>
                  <Grid item xs={12}>
                    <ScrollAnimation direction="up" delay={0.8}>
                      <Suspense fallback={<LoadingFallback />}>
                        <PostsList />
                      </Suspense>
                    </ScrollAnimation>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box mt={4}>
                  <AIRecommendations />
                </Box>
              </TabPanel>
            </>
          ) : (
            <>
              <Grid container spacing={4} sx={{ mt: 4 }}>
                <Grid item xs={12}>
                  <ScrollAnimation direction="up" delay={0.6}>
                    <Box sx={{ position: "relative", mb: 6, mt: 2 }}>
                      <FeaturedChip
                        label="Featured Content"
                        color="primary"
                        icon={<WhatshotIcon />}
                      />
                      {loadingFeaturedPost ? (
                        <LoadingFallback />
                      ) : featuredPost ? (
                        <Paper
                          elevation={3}
                          sx={{
                            borderRadius: 4,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Grid container>
                            <Grid item xs={12} md={6}>
                              <Box
                                sx={{
                                  height: { xs: 200, md: "100%" },
                                  backgroundImage: featuredPost.picture
                                    ? `url(${featuredPost.picture})`
                                    : "url(https://source.unsplash.com/random/600x400/?health)",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ p: 4 }}>
                                <Typography
                                  variant="overline"
                                  color="primary.main"
                                  fontWeight={600}
                                >
                                  MOST LIKED POST
                                </Typography>
                                <Typography
                                  variant="h4"
                                  sx={{ mt: 1, mb: 2, fontWeight: 700 }}
                                >
                                  {featuredPost.title}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                  sx={{ mb: 3 }}
                                >
                                  {featuredPost.description.length > 150
                                    ? `${featuredPost.description.substring(
                                        0,
                                        150
                                      )}...`
                                    : featuredPost.description}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  onClick={() =>
                                    navigate(`/details/${featuredPost._id}`)
                                  }
                                  sx={{
                                    borderRadius: 8,
                                    textTransform: "none",
                                    fontWeight: 600,
                                  }}
                                >
                                  Read Article
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      ) : (
                        <Paper
                          elevation={3}
                          sx={{
                            borderRadius: 4,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                            p: 4,
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="h6">
                            No featured content available at the moment
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </ScrollAnimation>
                </Grid>
              </Grid>

              <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                  <ScrollAnimation direction="up" delay={0.2}>
                    <FeatureCard>
                      <IconWrapper className="icon-wrapper">
                        <TrendingUpIcon
                          sx={{
                            fontSize: 32,
                            color: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(59, 130, 246, 0.9)"
                                : "rgba(14, 165, 233, 0.9)",
                          }}
                        />
                      </IconWrapper>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Trending Topics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stay updated with the most popular health discussions
                        and breakthroughs happening right now.
                      </Typography>
                    </FeatureCard>
                  </ScrollAnimation>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ScrollAnimation direction="up" delay={0.4}>
                    <FeatureCard>
                      <IconWrapper className="icon-wrapper">
                        <WhatshotIcon
                          sx={{
                            fontSize: 32,
                            color: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(239, 68, 68, 0.9)"
                                : "rgba(220, 38, 38, 0.9)",
                          }}
                        />
                      </IconWrapper>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Hot Discussions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Join vibrant conversations about health topics that
                        matter to you and connect with like-minded individuals.
                      </Typography>
                    </FeatureCard>
                  </ScrollAnimation>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ScrollAnimation direction="up" delay={0.6}>
                    <FeatureCard>
                      <IconWrapper className="icon-wrapper">
                        <AutoAwesomeIcon
                          sx={{
                            fontSize: 32,
                            color: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(234, 179, 8, 0.9)"
                                : "rgba(202, 138, 4, 0.9)",
                          }}
                        />
                      </IconWrapper>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Expert Insights
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Learn from healthcare professionals and thought leaders
                        sharing their knowledge and experiences.
                      </Typography>
                    </FeatureCard>
                  </ScrollAnimation>
                </Grid>
              </Grid>

              <SectionDivider>
                <Chip label="LATEST POSTS" />
              </SectionDivider>

              <Grid container spacing={4} ref={postsRef}>
                <Grid item xs={12}>
                  <ScrollAnimation direction="up" delay={0.8}>
                    <Suspense fallback={<LoadingFallback />}>
                      <PostsList />
                    </Suspense>
                  </ScrollAnimation>
                </Grid>
              </Grid>
            </>
          )}
        </ContentWrapper>
      </StyledContainer>

      <ParallaxSection
        style={{
          background:
            "linear-gradient(45deg, #7dd3fc 0%, #0ea5e9 50%, #3b82f6 100%)",
          padding: "48px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <ScrollAnimation direction="up" delay={0.2}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              marginBottom: 2,
              color: "inherit",
            }}
          >
            {/* Welcome to PatientZero */}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              maxWidth: "800px",
              margin: "0 auto 2rem",
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.6,
            }}
          >
            A collaborative platform designed to empower patients and healthcare
            professionals. Share health stories, connect with others on their
            recovery journeys, and access valuable information from medical
            experts.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "700px",
              margin: "0 auto 3rem",
              color: "rgba(255,255,255,0.8)",
              fontSize: "1.1rem",
            }}
          >
            Dive into our community-driven content and join conversations that
            bring meaningful support to health experiences.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/create/post"
            sx={{
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "12px 32px",
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.25)",
                transform: "translateY(-3px)",
                boxShadow: "0 20px 40px rgba(14,165,233,0.3)",
              },
            }}
          >
            Share Your Story
          </Button>
        </ScrollAnimation>
      </ParallaxSection>
    </Box>
  );
};

export default Home;
