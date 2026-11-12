
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router";
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

  const currentUserId = user?._id || user?.id;

  // Fetch comments from backend
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchComments = async () => {
      setLoading(true);
      setError("");

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
          throw new Error(
            data.message || "Failed to fetch comments"
          );
        }

        if (!controller.signal.aborted) {
          setComments(data.comments || []);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchComments();

    return () => controller.abort();
  }, [postId, token]);

  // Create a new comment
  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = newComment.trim();

    if (!content || content.length > 500) {
      setMessage(
        "Comment must contain 1 to 500 characters."
      );
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
        throw new Error(
          data.message || "Failed to add comment"
        );
      }

      // Keep populated author information from backend
      const commentWithAuthor = {
        ...data.comment,
        author:
          data.comment.author &&
          typeof data.comment.author === "object"
            ? data.comment.author
            : {
                _id: currentUserId,
                username: user?.username,
                profilePicture: user?.profilePicture || "",
              },
      };

      setComments((previousComments) => [
        commentWithAuthor,
        ...previousComments,
      ]);

      setNewComment("");
      setMessage("Comment added successfully!");
    } catch (err) {
      setMessage(err.message);
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
        throw new Error(
          data.message || "Failed to delete comment"
        );
      }

      setComments((previousComments) =>
        previousComments.filter(
          (comment) => comment._id !== commentId
        )
      );

      setMessage("Comment deleted successfully!");
    } catch (err) {
      setMessage(err.message);
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
      {comments.map((comment) => {
        const author = comment.author;

        const authorId =
          author && typeof author === "object"
            ? author._id || author.id
            : author;

        const username =
          author?.username || "Unknown user";

        const profilePicture =
          author?.profilePicture || "";

        const profileLink =
          authorId === currentUserId
            ? "/profile"
            : `/users/${authorId}`;

        return (
          <div key={comment._id} className="comment">
            {/* Profile picture */}
            {authorId ? (
              <Link to={profileLink}>
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={`${username}'s profile`}
                    className="comment-avatar"
                  />
                ) : (
                  <div className="comment-avatar comment-avatar-placeholder">
                    👤
                  </div>
                )}
              </Link>
            ) : (
              <div className="comment-avatar comment-avatar-placeholder">
                👤
              </div>
            )}

            {/* Comment information */}
            <div className="comment-body">
              <div className="comment-header">
                {authorId ? (
                  <Link to={profileLink}>
                    <strong>@{username}</strong>
                  </Link>
                ) : (
                  <strong>@{username}</strong>
                )}

                {comment.createdAt && (
                  <small>
                    {new Date(
                      comment.createdAt
                    ).toLocaleString()}
                  </small>
                )}
              </div>

              <p>{comment.content}</p>

              {/* Delete your own comment */}
              {authorId === currentUserId && (
                <button
                  type="button"
                  className="delete-comment-btn"
                  onClick={() =>
                    handleDelete(comment._id)
                  }
                  disabled={deletingId === comment._id}
                >
                  {deletingId === comment._id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Add a new comment */}
      <form
        onSubmit={handleSubmit}
        className="comment-form"
      >
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) =>
            setNewComment(e.target.value)
          }
          maxLength={500}
          required
        />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Posting..." : "Comment"}
        </button>
      </form>

      {message && (
        <p role="status">{message}</p>
      )}
    </div>
  );
}

export default Comments;
