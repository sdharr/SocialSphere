
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function LikeButton({ post }) {
  const { user, token } = useContext(AuthContext);

  const [liked, setLiked] = useState(
    post.likes?.some((id) => id.toString() === user.id) || false
  );

  const [likesCount, setLikesCount] = useState(
    post.likes?.length || 0
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLike = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/posts/${post._id}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update like");
      }

      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="like-section">
      <button
        type="button"
        onClick={handleLike}
        disabled={loading}
        aria-pressed={liked}
      >
        {liked ? "❤️ Unlike" : "🤍 Like"}
      </button>

      <span>{likesCount} likes</span>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default LikeButton;
