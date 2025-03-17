import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  TextField,
  Chip,
  Divider,
  Alert,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Link,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RecommendIcon from "@mui/icons-material/Recommend";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import InfoIcon from "@mui/icons-material/Info";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import {
  getHealthRecommendations,
  analyzeHealthStatus,
  getHealthProfile,
  updateHealthProfile,
} from "../../../service/healthService";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));

const RecommendationItem = styled(Box)(({ theme, isNutritious }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: isNutritious
    ? theme.palette.success.light + "15"
    : theme.palette.grey[50],
  border: `1px solid ${
    isNutritious ? theme.palette.success.light : theme.palette.grey[200]
  }`,
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const RecommendationsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const RecommendationCard = styled(Card)(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  },
}));

const CardImageContainer = styled(Box)(({ theme }) => ({
  width: 120,
  [theme.breakpoints.down("sm")]: {
    width: 80,
  },
}));

const CardDetails = styled(CardContent)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(2),
  "&:last-child": {
    paddingBottom: theme.spacing(2),
  },
}));

const RecommendationReason = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

const RelevanceScore = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(1),
}));

const ScoreChip = styled(Chip)(({ theme, score }) => ({
  backgroundColor:
    score >= 80
      ? theme.palette.success.light
      : score >= 60
      ? theme.palette.info.light
      : theme.palette.warning.light,
  color:
    score >= 80
      ? theme.palette.success.contrastText
      : score >= 60
      ? theme.palette.info.contrastText
      : theme.palette.warning.contrastText,
  fontWeight: "bold",
  marginRight: theme.spacing(1),
}));

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchedCategories, setMatchedCategories] = useState([]);

  const fetchRecommendations = async () => {
    const accountStr = sessionStorage.getItem("account");
    const account = accountStr ? JSON.parse(accountStr) : null;
    const username = account?.username;

    if (!username || !sessionStorage.getItem("accessToken")) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getHealthRecommendations(username);
      console.log("Recommendations data:", data);

      if (Array.isArray(data) && data.length > 0) {
        setRecommendations(data);
        // Get unique categories from all recommendations
        const categories = [...new Set(data.flatMap(rec => rec.matchedCategories || []))];
        setMatchedCategories(categories);
        setError("");
      } else {
        setError("No recommendations available. Try updating your health profile.");
        setRecommendations([]);
        setMatchedCategories([]);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations. Please try again later.");
      setRecommendations([]);
      setMatchedCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = () => {
    fetchRecommendations();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sessionStorage.getItem("accessToken")) {
    return (
      <Alert severity="info">
        Please log in to see personalized recommendations.
      </Alert>
    );
  }

  return (
    <StyledPaper>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
          <SmartToyIcon sx={{ mr: 1 }} />
          AI Recommendations
        </Typography>
        <Button
          startIcon={<RecommendIcon />}
          onClick={handleRefresh}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {error ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {matchedCategories.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recommended Categories:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {matchedCategories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          <RecommendationsContainer>
            {recommendations.map((post) => (
              <RecommendationCard key={post._id}>
                <CardImageContainer>
                  <CardMedia
                    component="img"
                    height="100%"
                    image={post.picture || "https://source.unsplash.com/random?health"}
                    alt={post.title}
                    sx={{ objectFit: "cover" }}
                  />
                </CardImageContainer>
                <CardDetails>
                  <Typography variant="h6" component={Link} to={`/details/${post._id}`} sx={{ textDecoration: "none", color: "inherit" }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {post.description.substring(0, 120)}...
                  </Typography>
                  <RecommendationReason>
                    {post.reasoning}
                  </RecommendationReason>
                  <RelevanceScore>
                    <ScoreChip
                      label={`Relevance: ${post.relevanceScore}%`}
                      score={post.relevanceScore}
                      size="small"
                    />
                    {post.categories && (
                      <Chip
                        label={post.categories}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                  </RelevanceScore>
                </CardDetails>
              </RecommendationCard>
            ))}
          </RecommendationsContainer>
        </>
      )}
    </StyledPaper>
  );
};

export default AIRecommendations;
