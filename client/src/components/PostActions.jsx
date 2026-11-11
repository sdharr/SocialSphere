
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function PostActions({ post, onUpdated, onDeleted }) {
  const { token } = useContext(AuthContext);

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit post
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Post cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/posts/${post._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: content.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      onUpdated(data.post);
      setEditing(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!window.confirm("Delete this post permanently?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/posts/${post._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      onDeleted(post._id);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-actions">
      {editing ? (
        <form onSubmit={handleUpdate}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={3}
            required
          />

          <button type="submit" disabled={loading}>
            Save
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setContent(post.content);
              setEditing(false);
              setError("");
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => setEditing(true)}
          >
            Edit
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </>
      )}

      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default PostActions;
