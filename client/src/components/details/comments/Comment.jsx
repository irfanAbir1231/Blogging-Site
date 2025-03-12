import { useContext, useState } from "react";
import {
  Typography,
  Box,
  styled,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Delete,
  ThumbUp,
  ThumbDown,
  ThumbUpOutlined,
  ThumbDownOutlined,
} from "@mui/icons-material";

import { API } from "../../../service/api";
import { DataContext } from "../../../context/DataProvider";

const Component = styled(Box)(({ theme }) => ({
  marginTop: "30px",
  background:
    theme.palette.mode === "dark" ? theme.palette.background.paper : "#f5f5f5",
  padding: "16px",
  borderRadius: "8px",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(0, 0, 0, 0.12)"
  }`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 2px 4px rgba(255, 255, 255, 0.05)"
      : "0 2px 4px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
}));

const Container = styled(Box)`
  display: flex;
  margin-bottom: 5px;
  align-items: center;
`;

const Name = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "16px",
  marginRight: "20px",
  color: theme.palette.text.primary,
}));

const StyledDate = styled(Typography)(({ theme }) => ({
  fontSize: "14px",
  color: theme.palette.text.secondary,
}));

const DeleteIcon = styled(Delete)(({ theme, disabled }) => ({
  marginLeft: "auto",
  cursor: "pointer",
  opacity: disabled ? 0.5 : 1,
  pointerEvents: disabled ? "none" : "auto",
  color: theme.palette.error.main,
  padding: "4px",
  borderRadius: "50%",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(244, 67, 54, 0.1)"
        : "rgba(244, 67, 54, 0.08)",
  },
}));

const CommentText = styled(Typography)(({ theme }) => ({
  marginTop: "8px",
  color: theme.palette.text.primary,
  lineHeight: 1.6,
  fontSize: "15px",
}));

const VoteContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  marginLeft: "auto",
  marginRight: "16px",
}));

const VoteCount = styled(Typography)(({ theme }) => ({
  fontSize: "14px",
  color: theme.palette.text.secondary,
  minWidth: "32px",
  textAlign: "center",
}));

const Comment = ({ comment, setToggle }) => {
  const { account } = useContext(DataContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [score, setScore] = useState(comment.score || 0);
  const [upvotes, setUpvotes] = useState(comment.upvotes || []);
  const [downvotes, setDownvotes] = useState(comment.downvotes || []);
  const theme = useTheme();

  const hasUpvoted = upvotes.includes(account.username);
  const hasDownvoted = downvotes.includes(account.username);

  const handleVote = async (voteType) => {
    if (isVoting) return;

    try {
      setIsVoting(true);
      const response = await API.voteComment(comment._id, {
        username: account.username,
        voteType,
      });

      if (response.isSuccess) {
        setUpvotes(response.data.comment.upvotes);
        setDownvotes(response.data.comment.downvotes);
        setScore(response.data.comment.score);
      }
    } catch (error) {
      console.error("Error voting on comment:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const removeComment = async () => {
    if (!comment._id) {
      console.error("No comment ID available");
      return;
    }

    try {
      setIsDeleting(true);
      const response = await API.deleteComment(comment._id);

      if (response.isSuccess) {
        setToggle((prev) => !prev);
      } else {
        console.error("Failed to delete comment:", response.msg);
        alert(response.msg || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      const errorMessage =
        error.response?.data?.msg ||
        error.message ||
        "Failed to delete comment";
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Component>
      <Container>
        <Name>{comment.name}</Name>
        <StyledDate>{new Date(comment.date).toDateString()}</StyledDate>
        <VoteContainer>
          <Tooltip title={hasUpvoted ? "Remove Upvote" : "Upvote"}>
            <IconButton
              onClick={() => handleVote("upvote")}
              disabled={isVoting}
              size="small"
              color={hasUpvoted ? "primary" : "default"}
            >
              {hasUpvoted ? (
                <ThumbUp fontSize="small" />
              ) : (
                <ThumbUpOutlined fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <VoteCount>{score}</VoteCount>
          <Tooltip title={hasDownvoted ? "Remove Downvote" : "Downvote"}>
            <IconButton
              onClick={() => handleVote("downvote")}
              disabled={isVoting}
              size="small"
              color={hasDownvoted ? "error" : "default"}
            >
              {hasDownvoted ? (
                <ThumbDown fontSize="small" />
              ) : (
                <ThumbDownOutlined fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </VoteContainer>
        {comment.name === account.username &&
          (isDeleting ? (
            <CircularProgress
              size={20}
              sx={{
                marginLeft: "auto",
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.light
                    : theme.palette.primary.main,
              }}
            />
          ) : (
            <DeleteIcon onClick={() => removeComment()} disabled={isDeleting} />
          ))}
      </Container>
      <CommentText>{comment.comments}</CommentText>
    </Component>
  );
};

export default Comment;
