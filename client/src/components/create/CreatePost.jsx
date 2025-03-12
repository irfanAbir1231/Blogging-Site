import React, { useState, useEffect, useContext, useRef } from "react";

import {
  styled,
  Box,
  TextareaAutosize,
  Button,
  InputBase,
  FormControl,
  Typography,
  Alert,
  CircularProgress,
  Skeleton,
  Select,
  MenuItem,
} from "@mui/material";
import { AddCircle as Add } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

import { API } from "../../service/api";
import { DataContext } from "../../context/DataProvider";
import { categories } from "../../constants/data";

const Container = styled(Box)(({ theme }) => ({
  margin: "50px 100px",
  [theme.breakpoints.down("md")]: {
    margin: "20px",
  },
  position: "relative",
  paddingTop: "64px", // Add space for the header/navbar
}));

const ImageContainer = styled(Box)({
  position: "relative",
  width: "100%",
  height: "50vh",
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: "#f5f5f5",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  marginBottom: "20px",
});

const Image = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const StyledFormControl = styled(FormControl)`
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const InputTextField = styled(InputBase)`
  flex: 1;
  margin: 0 30px;
  font-size: 25px;
  &.error {
    border-bottom: 2px solid #d32f2f;
  }
`;

const Textarea = styled(TextareaAutosize)`
  width: 100%;
  border: none;
  margin-top: 20px;
  font-size: 18px;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  &:focus-visible {
    outline: none;
  }
  &.error {
    border: 1px solid #d32f2f;
  }
`;

const UploadButton = styled(Box)`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  &:hover {
    background: #f0f0f0;
  }
`;

const StyledSelect = styled(Select)`
  flex: 1;
  margin: 0 30px;
  font-size: 25px;
`;

const initialPost = {
  title: "",
  description: "",
  picture: "",
  username: "",
  categories: "Nutrition", // Set default category
  createdDate: new Date(),
};

const CreatePost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account } = useContext(DataContext);

  const [post, setPost] = useState(initialPost);
  const [file, setFile] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  const fallbackUrl =
    "https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80";

  // Define a reference for the image element to test it directly
  const imgRef = useRef(null);

  // Test image directly in the browser with fetch
  const testImageWithFetch = async (url) => {
    try {
      console.log("Testing image URL with fetch:", url);
      const response = await fetch(url, { method: "HEAD" });
      console.log("Fetch response:", response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.error("Fetch test failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const getImage = async () => {
      if (file) {
        try {
          setIsUploading(true);
          const data = new FormData();
          data.append("file", file);

          console.log(
            "Uploading file:",
            file.name,
            "Type:",
            file.type,
            "Size:",
            file.size
          );
          const response = await API.uploadFile(data);
          console.log("Upload response:", response);
          console.log("Upload response data:", response.data);

          if (response.isSuccess && response.data) {
            // Extract the URL string properly
            let imageUrl;
            if (typeof response.data === "string") {
              imageUrl = response.data;
            } else if (
              typeof response.data === "object" &&
              response.data.data
            ) {
              imageUrl = response.data.data;
            } else if (typeof response.data.data === "string") {
              imageUrl = response.data.data;
            } else {
              console.error("Unexpected response format:", response.data);
              throw new Error("Invalid image URL format");
            }

            console.log("Extracted image URL:", imageUrl);

            // Wait a moment for the file to be available before setting the URL
            setTimeout(async () => {
              // Check if component is still mounted
              if (mounted) {
                // First, attempt to verify the image is accessible
                const isAccessible = await testImageWithFetch(imageUrl);
                console.log("Image accessibility test result:", isAccessible);

                setPost((prev) => ({ ...prev, picture: imageUrl }));
                setErrors((prev) => ({ ...prev, picture: "" }));
              }
            }, 1000); // Wait 1 second for server to process
          } else {
            throw new Error(response.msg || "Failed to upload image");
          }
        } catch (error) {
          console.error("Image upload error:", error);
          if (mounted) {
            setErrors((prev) => ({
              ...prev,
              picture:
                error.message || "Failed to upload image. Please try again.",
            }));
          }
        } finally {
          if (mounted) {
            setIsUploading(false);
          }
        }
      }
    };

    let mounted = true;
    getImage();

    return () => {
      mounted = false;
    };
  }, [file]);

  // Fix the image source useEffect to handle URL correctly
  useEffect(() => {
    // Set image source with a longer delay to allow the server to process the image
    if (post.picture) {
      console.log("Setting image source from picture:", post.picture);

      // Clean up any existing cache busting parameters
      let baseUrl = post.picture;
      if (baseUrl.includes("?")) {
        baseUrl = baseUrl.split("?")[0];
      }

      // Set loading state and clear error state
      setImageLoaded(false);
      setImageError(false);

      // Start with the fallback image
      setImageSrc(fallbackUrl);

      // Add a longer delay before loading the image to give the server time to process it
      const timer = setTimeout(async () => {
        // Try to fetch the image directly first
        const isAccessible = await testImageWithFetch(baseUrl);
        if (isAccessible) {
          console.log("Image is now accessible, setting as source");
          setImageSrc(baseUrl);
        } else {
          console.log("Image still not accessible, using fallback");
          setImageError(true);
        }
      }, 2000); // Try after 2 seconds

      return () => clearTimeout(timer);
    } else {
      setImageSrc(fallbackUrl);
    }
  }, [post.picture]);

  const handleImageError = () => {
    console.error("Failed to load image:", imageSrc);

    // Retry loading the image with a direct fetch
    fetch(imageSrc, { method: "HEAD" })
      .then((response) => {
        console.log("Image HEAD request result:", {
          status: response.status,
          ok: response.ok,
          headers: Array.from(response.headers.entries()),
        });

        if (!response.ok) {
          setImageError(true);
          setImageSrc(fallbackUrl);
        } else {
          // Try loading the image again with a fresh URL
          const freshUrl = `${imageSrc}?retry=${Date.now()}`;
          setImageSrc(freshUrl);
        }
      })
      .catch((error) => {
        console.error("Image fetch error:", error);
        setImageError(true);
        setImageSrc(fallbackUrl);
      });
  };

  useEffect(() => {
    let mounted = true;

    // Get category from URL and update post
    const category = location.search?.split("=")[1] || "All";
    if (mounted) {
      setPost((prev) => ({
        ...prev,
        categories: category,
        username: account.username,
      }));
    }

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [location.search, account.username]);

  const validatePost = () => {
    const newErrors = {};

    if (!post.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!post.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!post.picture) {
      newErrors.picture = "Please upload an image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const savePost = async () => {
    if (!validatePost()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      // Ensure all required fields are present and properly formatted
      const postData = {
        ...post,
        picture:
          typeof post.picture === "object" ? post.picture.data : post.picture,
        createdDate: new Date(),
      };

      console.log("Sending post data:", postData);

      const response = await API.createPost(postData);

      if (response.isSuccess) {
        navigate("/");
      } else {
        // Check if it's a duplicate title error
        if (response.field === "title") {
          setErrors((prev) => ({
            ...prev,
            title:
              response.msg ||
              "This title is already in use. Please choose a different title.",
          }));
        } else {
          setSubmitError(
            response.msg || "Failed to create post. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Create post error:", error);

      // Check if the error response contains field-specific error
      if (error.response?.data?.field) {
        const { field, msg } = error.response.data;
        setErrors((prev) => ({
          ...prev,
          [field]: msg,
        }));
      } else {
        setSubmitError(
          error.response?.data?.msg ||
            error.message ||
            "Failed to create post. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Container>
      <ImageContainer>
        {!imageLoaded && !imageError && (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        )}
        <Image
          ref={imgRef}
          src={imageSrc}
          alt="post"
          onLoad={() => {
            console.log("Image loaded successfully:", imageSrc);
            setImageLoaded(true);
          }}
          onError={handleImageError}
          style={{ opacity: imageLoaded ? 1 : 0 }}
          crossOrigin="anonymous"
        />
      </ImageContainer>

      <StyledFormControl>
        <UploadButton component="label" htmlFor="fileInput">
          <Add fontSize="large" color="action" />
          <Typography color="textSecondary">
            {isUploading ? "Uploading..." : "Upload Image"}
          </Typography>
        </UploadButton>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // Debug log
              console.log("Selected file type:", file.type);
              console.log("Selected file name:", file.name);

              // Check file type
              const validTypes = [
                "image/png",
                "image/jpg",
                "image/jpeg",
                "image/gif",
                "image/webp",
              ];

              // If file type is not detected, try to detect from extension
              const fileExtension = file.name.split(".").pop().toLowerCase();
              const extensionToMimeType = {
                png: "image/png",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                gif: "image/gif",
                webp: "image/webp",
              };

              const detectedType =
                file.type || extensionToMimeType[fileExtension];

              if (!detectedType || !validTypes.includes(detectedType)) {
                setErrors((prev) => ({
                  ...prev,
                  picture: `Invalid file type: ${file.name}. Only PNG, JPG, JPEG, GIF, and WEBP files are allowed.`,
                }));
                return;
              }

              // Check file size (5MB limit)
              if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                  ...prev,
                  picture: "File size too large. Maximum size is 5MB.",
                }));
                return;
              }

              setFile(file);
              setErrors((prev) => ({ ...prev, picture: "" }));
            }
          }}
          accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
        />
        <InputTextField
          onChange={handleChange}
          name="title"
          placeholder="Title"
          className={errors.title ? "error" : ""}
          value={post.title}
        />
        <Button
          onClick={savePost}
          variant="contained"
          color="primary"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Publish"
          )}
        </Button>
      </StyledFormControl>

      {errors.title && (
        <Typography color="error" variant="caption" sx={{ ml: 2 }}>
          {errors.title}
        </Typography>
      )}

      <StyledFormControl>
        <label htmlFor="category">Category:</label>
        <StyledSelect
          value={post.categories}
          onChange={(e) => setPost({ ...post, categories: e.target.value })}
          id="category"
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.type}>
              {category.type}
            </MenuItem>
          ))}
        </StyledSelect>
      </StyledFormControl>

      <Textarea
        minRows={5}
        placeholder="Tell your story..."
        name="description"
        onChange={handleChange}
        className={errors.description ? "error" : ""}
        value={post.description}
      />

      {errors.description && (
        <Typography color="error" variant="caption" sx={{ ml: 2 }}>
          {errors.description}
        </Typography>
      )}

      {errors.picture && (
        <Typography color="error" variant="caption" sx={{ ml: 2 }}>
          {errors.picture}
        </Typography>
      )}

      {submitError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {submitError}
        </Alert>
      )}
    </Container>
  );
};

export default CreatePost;
