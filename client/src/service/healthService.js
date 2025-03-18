import axios from "axios";
import { API } from "./api";
import { categories } from "../constants/data";

const API_URL = "http://localhost:8000";

// Get health profile for a user
export const getHealthProfile = async (username) => {
  try {
    // Check if access token exists
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("No access token found, returning empty profile");
      return {
        username,
        conditions: [],
        goals: [],
        currentStatus: "",
        history: [],
      };
    }

    const response = await axios.get(`${API_URL}/health/profile/${username}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching health profile:", error);
    if (error.response && error.response.status === 404) {
      // If profile not found, create a new one
      try {
        const newProfile = await updateHealthProfile({
          username,
          conditions: [],
          goals: [],
          currentStatus: "",
        });
        return newProfile.profile;
      } catch (createError) {
        console.error("Error creating health profile:", createError);
      }
    }

    // For other errors, return a default profile
    return {
      username,
      conditions: [],
      goals: [],
      currentStatus: "",
      history: [],
    };
  }
};

// Update health profile
export const updateHealthProfile = async (data) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await axios.put(
      `${API_URL}/health/profile/${data.username}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data?.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error("Error updating health profile:", error);
    throw error;
  }
};

// Mock analysis function until backend is ready
const mockAnalyzeText = (text) => {
  const lowercaseText = text.toLowerCase();
  return categories.filter(cat => 
    lowercaseText.includes(cat.type.toLowerCase())
  ).map(cat => cat.type);
};

// Analyze current health status
export const analyzeHealthStatus = async (username, statusUpdate) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken || !statusUpdate) {
      return { categories: [], insights: [] };
    }

    // Use local analysis until backend is ready
    const matchedCategories = mockAnalyzeText(statusUpdate);
    
    return {
      categories: matchedCategories,
      insights: [`Your status update matches ${matchedCategories.length} health categories`]
    };
  } catch (error) {
    console.error("Error analyzing health status:", error);
    return { categories: [], insights: [] };
  }
};

// Analyze health condition
export const analyzeHealthCondition = async (username, condition, isRemoval = false) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken || !condition) {
      return { categories: [], insights: [] };
    }

    // Use local analysis until backend is ready
    const matchedCategories = mockAnalyzeText(condition);
    
    return {
      categories: isRemoval ? [] : matchedCategories,
      insights: isRemoval ? 
        [`Removed condition from ${matchedCategories.length} health categories`] :
        [`Added condition to ${matchedCategories.length} health categories`]
    };
  } catch (error) {
    console.error("Error analyzing health condition:", error);
    return { categories: [], insights: [] };
  }
};

// Analyze health goals
export const analyzeHealthGoals = async (username, goals) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken || !goals?.length) {
      return { categories: [], insights: [] };
    }

    // Use local analysis until backend is ready
    const allCategories = goals.flatMap(goal => mockAnalyzeText(goal));
    const uniqueCategories = [...new Set(allCategories)];
    
    return {
      categories: uniqueCategories,
      insights: [`Your goals align with ${uniqueCategories.length} health categories`]
    };
  } catch (error) {
    console.error("Error analyzing health goals:", error);
    return { categories: [], insights: [] };
  }
};

// Get health recommendations based on health profile
export const getHealthRecommendations = async (username) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("No access token found, returning empty recommendations");
      return [];
    }

    console.log("Fetching recommendations for user:", username);
    const response = await axios.get(
      `${API_URL}/health/recommendations/${username}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Mock recommendations until backend is ready
    const mockRecommendations = [
      {
        id: 1,
        title: "Healthy Eating Tips",
        description: "Learn about balanced nutrition...",
        categories: ["Nutrition"]
      },
      {
        id: 2,
        title: "Mental Wellness Guide",
        description: "Strategies for mental health...",
        categories: ["Mental Health"]
      },
      {
        id: 3,
        title: "Exercise Fundamentals",
        description: "Basic workout routines...",
        categories: ["Exercise"]
      }
    ];

    return mockRecommendations;
  } catch (error) {
    console.error("Error fetching health recommendations:", error);
    return [];
  }
};

// Get health profile analysis
export const getHealthAnalysis = async (username) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await axios.post(
      `${API_URL}/health/analyze`,
      { username },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting health analysis:", error);
    return {
      summary: "Unable to analyze health profile",
      recommendations: [
        "Please update your health profile to get personalized recommendations",
      ],
    };
  }
};
