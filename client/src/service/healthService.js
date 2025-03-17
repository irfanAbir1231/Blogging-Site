import axios from "axios";
import { API } from "./api";

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
export const updateHealthProfile = async (profileData) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await axios.post(
      `${API_URL}/health/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating health profile:", error);
    // If unauthorized, try to refresh token or redirect to login
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    throw error;
  }
};

// Get AI recommendations based on health profile
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

    console.log("Recommendations response:", response.data);

    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.recommendations) {
      return response.data.recommendations;
    } else if (response.data && typeof response.data === 'object') {
      // If we got an object but not in the expected format
      console.warn("Unexpected recommendations format:", response.data);
      return [];
    }

    return [];
  } catch (error) {
    console.error("Error fetching health recommendations:", error);
    if (error.response) {
      console.error("Response error data:", error.response.data);
    }
    // If unauthorized, try to refresh token or redirect to login
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("accessToken");
      // Don't redirect, just return empty array
    }
    return [];
  }
};

// Analyze current health status
export const analyzeHealthStatus = async (username, statusUpdate) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await axios.post(
      `${API_URL}/health/analyze`,
      { username, statusUpdate },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error analyzing health status:", error);
    // If unauthorized, try to refresh token or redirect to login
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    // If profile not found, try to create one
    if (error.response && error.response.status === 404) {
      try {
        await updateHealthProfile({
          username,
          conditions: [],
          goals: [],
          currentStatus: statusUpdate,
        });

        return {
          message: "Health profile created with initial status",
          needsNutrition:
            statusUpdate.toLowerCase().includes("nutrition") ||
            statusUpdate.toLowerCase().includes("food") ||
            statusUpdate.toLowerCase().includes("diet"),
        };
      } catch (createError) {
        console.error("Error creating health profile:", createError);
      }
    }

    throw error;
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
