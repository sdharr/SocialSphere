
import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";

function Comments({ postId }) {
  const { user, token } = useContext(AuthContext);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Fetch comments from backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchComments = async () => {
      try {
        const response = await fetch(
          `/api/posts/${postId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch comments");
        }

        setComments(data.comments);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      fetchComments();
    }

    return () => controller.abort();
  }, [postId, token]);

  // Create a new comment
  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = newComment.trim();

    if (!content || content.length > 500) {
      setMessage("Comment must contain 1 to 500 characters.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment");
      }

      const commentWithAuthor = {
        ...data.comment,
        author: {
          _id: user.id,
          username: user.username,
        },
      };

      setComments((previousComments) => [
        commentWithAuthor,
        ...previousComments,
      ]);

      setNewComment("");
      setMessage("Comment added successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete your own comment
  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    setDeletingId(commentId);
    setMessage("");

    try {
      const response = await fetch(
        `/api/posts/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete comment");
      }

      setComments((previousComments) =>
        previousComments.filter(
          (comment) => comment._id !== commentId
        )
      );

      setMessage("Comment deleted successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="comments-section">
      <h4>Comments</h4>

      {loading && <p>Loading comments...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && comments.length === 0 && (
        <p>No comments yet.</p>
      )}

      {/* Display existing comments */}
      {comments.map((comment) => (
        <div key={comment._id} className="comment">
          <strong>
            {comment.author?.username || "Unknown user"}
          </strong>

          <p>{comment.content}</p>

          {comment.author?._id === user?.id && (
            <button
              type="button"
              className="delete-comment-btn"
              onClick={() => handleDelete(comment._id)}
              disabled={deletingId === comment._id}
            >
              {deletingId === comment._id
                ? "Deleting..."
                : "Delete"}
            </button>
          )}
        </div>
      ))}

      {/* Add new comment */}
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={500}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Comment"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </div>
  );
}

export default Comments;
