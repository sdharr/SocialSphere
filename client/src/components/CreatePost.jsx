
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function CreatePost({ onPostCreated }) {
  const { token } = useContext(AuthContext);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || content.trim().length > 1000) {
      setMessage("Post must contain 1 to 1000 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setContent("");
      setMessage("Post published successfully!");

      onPostCreated(data.post);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <h3>Create a Post</h3>

      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={4}
        required
      />

      <p>{content.length}/1000 characters</p>

      <button type="submit" disabled={loading}>
        {loading ? "Publishing..." : "Publish Post"}
      </button>

      <p role="status">{message}</p>
    </form>
  );
}

export default CreatePost;
