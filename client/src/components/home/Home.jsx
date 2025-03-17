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
import { Suspense, lazy, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  borderRadius: 16,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  background: theme.palette.background.paper,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  background: theme.palette.primary.light,
  color: theme.palette.primary.main,
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

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { account } = useContext(DataContext);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("accessToken")
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      <ParallaxSection
        backgroundImage="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        overlayColor="rgba(0,0,0,0.5)"
      >
        <ScrollAnimation direction="up" delay={0.2}>
          <Typography
            variant="h1"
            sx={{
              color: "white",
              mb: 2,
              textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
              fontWeight: 800,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Welcome to{" "}
            <Box component="span" sx={{ color: "primary.light" }}>
              BlogSpace
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              opacity: 1,
              textShadow: "1px 1px 4px rgba(0,0,0,0.4)",
              mb: 4,
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Discover amazing stories and share your thoughts with our growing
            community of writers and readers
          </Typography>
        </ScrollAnimation>
      </ParallaxSection>

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

          <Box sx={{ position: "relative", zIndex: 2 }}>
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
                                  backgroundImage:
                                    "url(https://source.unsplash.com/random/600x400/?health)",
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
                                  EDITOR'S PICK
                                </Typography>
                                <Typography
                                  variant="h4"
                                  sx={{ mt: 1, mb: 2, fontWeight: 700 }}
                                >
                                  Discover the Latest Health Trends
                                </Typography>
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                  sx={{ mb: 3 }}
                                >
                                  Explore cutting-edge research and expert
                                  insights on maintaining optimal health in
                                  today's fast-paced world.
                                </Typography>
                                <Button
                                  variant="outlined"
                                  onClick={() => navigate("/details/featured")}
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
                      </Box>
                    </ScrollAnimation>
                  </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ mb: 6 }}>
                  <Grid item xs={12} md={4}>
                    <ScrollAnimation direction="up" delay={0.2}>
                      <FeatureCard>
                        <IconWrapper>
                          <TrendingUpIcon fontSize="large" />
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
                        <IconWrapper>
                          <WhatshotIcon fontSize="large" />
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
                        <IconWrapper>
                          <AutoAwesomeIcon fontSize="large" />
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

                <Grid container spacing={4}>
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
                                backgroundImage:
                                  "url(https://source.unsplash.com/random/600x400/?health)",
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
                                EDITOR'S PICK
                              </Typography>
                              <Typography
                                variant="h4"
                                sx={{ mt: 1, mb: 2, fontWeight: 700 }}
                              >
                                Discover the Latest Health Trends
                              </Typography>
                              <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 3 }}
                              >
                                Explore cutting-edge research and expert
                                insights on maintaining optimal health in
                                today's fast-paced world.
                              </Typography>
                              <Button
                                variant="outlined"
                                onClick={() => navigate("/details/featured")}
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
                    </Box>
                  </ScrollAnimation>
                </Grid>
              </Grid>

              <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                  <ScrollAnimation direction="up" delay={0.2}>
                    <FeatureCard>
                      <IconWrapper>
                        <TrendingUpIcon fontSize="large" />
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
                      <IconWrapper>
                        <WhatshotIcon fontSize="large" />
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
                      <IconWrapper>
                        <AutoAwesomeIcon fontSize="large" />
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

              <Grid container spacing={4}>
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
        backgroundImage="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
        overlayColor="rgba(0,0,0,0.6)"
      >
        <ScrollAnimation direction="up" delay={0.2}>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Join Our Community
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              opacity: 1,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              mb: 4,
              maxWidth: "700px",
              mx: "auto",
            }}
          >
            Share your stories and connect with other writers passionate about
            health and wellness
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 30,
              borderWidth: 2,
              px: 4,
              py: 1,
              fontSize: "1rem",
              textTransform: "none",
              opacity: 1,
              "&:hover": {
                borderWidth: 2,
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={() => navigate("/account/register")}
          >
            Sign Up Now
          </Button>
        </ScrollAnimation>
      </ParallaxSection>
    </Box>
  );
};

export default Home;
