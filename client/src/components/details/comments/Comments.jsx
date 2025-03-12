import { useState, useEffect, useContext } from "react";
import { Box, TextareaAutosize, Button, styled, useTheme } from "@mui/material";

import { DataContext } from "../../../context/DataProvider";

import { API } from "../../../service/api";

//components
import Comment from "./Comment";

const Container = styled(Box)`
  margin-top: 100px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
`;

const Image = styled("img")({
  width: 50,
  height: 50,
  borderRadius: "50%",
});

const StyledTextArea = styled(TextareaAutosize)(({ theme }) => ({
  height: "100px !important",
  width: "100%",
  padding: "15px",
  borderRadius: "8px",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(0, 0, 0, 0.12)"
  }`,
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.background.paper : "#ffffff",
  color: theme.palette.text.primary,
  resize: "vertical",
  fontFamily: theme.typography.fontFamily,
  fontSize: "16px",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor:
      theme.palette.mode === "dark"
        ? theme.palette.primary.light
        : theme.palette.primary.main,
  },
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${
      theme.palette.mode === "dark"
        ? "rgba(144, 202, 249, 0.2)"
        : "rgba(25, 118, 210, 0.2)"
    }`,
  },
  "&::placeholder": {
    color: theme.palette.text.secondary,
  },
}));

const initialValue = {
  name: "",
  postId: "",
  date: new Date(),
  comments: "",
};

const Comments = ({ post }) => {
  const url = "https://static.thenounproject.com/png/12017-200.png";
  const theme = useTheme();

  const [comment, setComment] = useState(initialValue);
  const [comments, setComments] = useState([]);
  const [toggle, setToggle] = useState(false);

  const { account } = useContext(DataContext);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await API.getAllComments(post._id);
        if (response.isSuccess) {
          setComments(response.data);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    if (post._id) {
      getData();
    }
  }, [toggle, post._id]);

  const handleChange = (e) => {
    setComment({
      ...comment,
      name: account.username,
      postId: post._id,
      comments: e.target.value,
    });
  };

  const addComment = async () => {
    if (!comment.comments.trim()) return; // Don't submit empty comments

    try {
      await API.newComment(comment);
      setComment(initialValue);
      setToggle((prev) => !prev);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Container>
        <Image src={url} alt="dp" />
        <Box sx={{ flex: 1 }}>
          <StyledTextArea
            minRows={5}
            placeholder="What's on your mind?"
            onChange={(e) => handleChange(e)}
            value={comment.comments}
          />
          <Button
            variant="contained"
            color="primary"
            size="medium"
            sx={{
              mt: 2,
              height: 40,
              textTransform: "none",
              borderRadius: "8px",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 2px 4px rgba(255, 255, 255, 0.1)"
                  : "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => addComment(e)}
          >
            Post Comment
          </Button>
        </Box>
      </Container>
      <Box sx={{ mt: 4 }}>
        {comments &&
          comments.length > 0 &&
          comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              setToggle={setToggle}
            />
          ))}
      </Box>
    </Box>
  );
};

export default Comments;
