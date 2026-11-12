
import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";

function LikeButton({ post }) {
  const { user, token } = useContext(AuthContext);

  const currentUserId = user?._id || user?.id;

  const checkLiked = () =>
    (post.likes || []).some((like) => {
      const likeId = like?._id || like;
      return String(likeId) === String(currentUserId);
    });

  const [liked, setLiked] = useState(checkLiked);
  const [likesCount, setLikesCount] = useState(
    post.likes?.length || 0
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep state in sync when a different post is loaded
  useEffect(() => {
    setLiked(checkLiked());
    setLikesCount(post.likes?.length || 0);
  }, [post._id, post.likes, currentUserId]);

  const handleLike = async () => {
    if (loading || !token) return;

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
        throw new Error(
          data.message || "Failed to update like"
        );
      }

      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ss-like-container">
      <button
        type="button"
        className={`ss-like-btn ${liked ? "is-liked" : ""}`}
        onClick={handleLike}
        disabled={loading}
        aria-pressed={liked}
        aria-label={liked ? "Unlike post" : "Like post"}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>

        <span>{liked ? "Liked" : "Like"}</span>
        <span className="ss-like-count">{likesCount}</span>
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default LikeButton;
