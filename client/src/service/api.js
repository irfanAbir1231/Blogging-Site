import axios from "axios";

import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from "../constants/config";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  getType,
} from "../utils/common-utils";

const API_URL = "http://localhost:8000";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "content-type": "application/json",
  },
});

// Add request interceptor for caching
axiosInstance.interceptors.request.use(
  function (config) {
    // Add cache control headers
    config.headers["Cache-Control"] = "no-cache";

    // Handle file upload
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
      delete config.headers["content-type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    // Add authorization header if token exists
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Handle query parameters for different HTTP methods
    if (config.TYPE?.params) {
      config.params = config.TYPE.params;
    } else if (config.TYPE?.query) {
      // For DELETE requests, handle the ID parameter differently
      if (config.method.toLowerCase() === "delete") {
        // Log the URL and data for debugging
        console.log("DELETE request URL before:", config.url);
        console.log("DELETE request data:", config.data);

        // Ensure the URL doesn't have double slashes
        const baseUrl = config.url.endsWith("/")
          ? config.url.slice(0, -1)
          : config.url;
        config.url = `${baseUrl}/${config.data}`;

        console.log("DELETE request URL after:", config.url);
        // Clear the data since we don't need to send a body for DELETE
        config.data = undefined;
      } else {
        config.url = `${config.url}/${config.TYPE.query}`;
      }
    }

    // Log the final request configuration
    console.log("Final request config:", {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add response interceptor for caching and token refresh
axiosInstance.interceptors.response.use(
  function (response) {
    // Cache successful GET requests
    if (response.config.method === "get") {
      const cacheKey =
        response.config.url + JSON.stringify(response.config.params);
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return processResponse(response);
  },
  async function (error) {
    const originalRequest = error.config;

    // If error is 403 and we haven't tried to refresh token yet
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${API_URL}/token`, {
          token: refreshToken,
        });

        if (response.data?.accessToken) {
          setAccessToken(response.data.accessToken);
          // Retry the original request
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${response.data.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh fails, clear session and reject
        sessionStorage.clear();
        return Promise.reject(ProcessError(error));
      }
    }

    return Promise.reject(ProcessError(error));
  }
);

///////////////////////////////
// If success -> returns { isSuccess: true, data: object }
// If fail -> returns { isFailure: true, status: string, msg: string, code: int }
//////////////////////////////
const processResponse = (response) => {
  if (response?.status === 200) {
    return { isSuccess: true, data: response.data };
  } else {
    return {
      isFailure: true,
      status: response?.status,
      msg: response?.msg || "Request failed",
      code: response?.code,
    };
  }
};

///////////////////////////////
// If success -> returns { isSuccess: true, data: object }
// If fail -> returns { isError: true, status: string, msg: string, code: int }
//////////////////////////////
const ProcessError = async (error) => {
  if (error.response) {
    if (error.response?.status === 403) {
      sessionStorage.clear();
    } else {
      console.log("ERROR IN RESPONSE: ", error.toJSON());
      return {
        isError: true,
        msg:
          error.response.data?.msg || API_NOTIFICATION_MESSAGES.responseFailure,
        code: error.response.status,
      };
    }
  } else if (error.request) {
    console.log("ERROR IN RESPONSE: ", error.toJSON());
    return {
      isError: true,
      msg: API_NOTIFICATION_MESSAGES.requestFailure,
      code: "",
    };
  } else {
    console.log("ERROR IN RESPONSE: ", error.toJSON());
    return {
      isError: true,
      msg: API_NOTIFICATION_MESSAGES.networkError,
      code: "",
    };
  }
};

const API = {};

// First, add all the standard API endpoints
for (const [key, value] of Object.entries(SERVICE_URLS)) {
  if (key !== "votePost" && key !== "voteComment") {
    // Skip vote endpoints
    API[key] = async (body, showUploadProgress, showDownloadProgress) => {
      try {
        // Check cache for GET requests
        if (value.method === "get") {
          const cachedData = getCachedData(value.url, body);
          if (cachedData) {
            return { isSuccess: true, data: cachedData };
          }
        }

        const requestConfig = {
          method: value.method,
          url: value.url,
          data: body,
          responseType: value.responseType,
          headers: {
            authorization: getAccessToken(),
          },
          TYPE: getType(value, body),
        };

        // Handle file uploads
        if (body instanceof FormData) {
          requestConfig.headers["Content-Type"] = "multipart/form-data";
          delete requestConfig.headers["content-type"];
        }

        if (showUploadProgress) {
          requestConfig.onUploadProgress = function (progressEvent) {
            let percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            showUploadProgress(percentCompleted);
          };
        }

        if (showDownloadProgress) {
          requestConfig.onDownloadProgress = function (progressEvent) {
            let percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            showDownloadProgress(percentCompleted);
          };
        }

        const response = await axiosInstance(requestConfig);
        return response;
      } catch (error) {
        console.error(`API Error (${key}):`, error);
        throw error;
      }
    };
  }
}

// Then add the vote endpoints separately
API.votePost = async (postId, data) => {
  try {
    console.log("Sending vote request:", { postId, data });
    const response = await axiosInstance({
      method: "POST",
      url: `/post/vote/${postId}`,
      data,
      headers: {
        "Content-Type": "application/json",
        authorization: getAccessToken(),
      },
    });

    console.log("Raw vote response:", response); // Log the raw response

    // If the response has data property, return it properly formatted
    if (response?.data) {
      return {
        isSuccess: true,
        data: response.data.data || response.data, // Handle both response structures
      };
    }

    // If we get here, something went wrong
    return {
      isSuccess: false,
      msg: "Invalid response format",
    };
  } catch (error) {
    console.error("Error in votePost API:", error);
    console.error("Error response:", error.response?.data); // Log the error response data

    // If we have an error response with data, use that
    if (error.response?.data) {
      return {
        isSuccess: false,
        msg: error.response.data.msg || "Error voting on post",
        ...error.response.data,
      };
    }

    // Otherwise return a generic error
    return {
      isSuccess: false,
      msg: "Error voting on post",
    };
  }
};

API.voteComment = async (commentId, data) => {
  try {
    const response = await axiosInstance({
      method: "POST",
      url: `/comment/vote/${commentId}`,
      data,
      headers: {
        authorization: getAccessToken(),
      },
    });
    return processResponse(response);
  } catch (error) {
    console.error("Error in voteComment API:", error);
    return {
      isSuccess: false,
      msg: error.response?.data?.msg || "Error voting on comment",
    };
  }
};

// Helper function to check cache
const getCachedData = (url, params) => {
  const cacheKey = url + JSON.stringify(params);
  const cachedData = cache.get(cacheKey);

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }
  return null;
};

export { API };
