
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import ImageUpload from "./ImageUpload";

function CreatePost({ onPostCreated }) {
  const { user, token } = useContext(AuthContext);

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadKey, setUploadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !imageUrl) {
      setMessage("Please add text or an image.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          image: imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create post"
        );
      }

      onPostCreated(data.post || data);

      setContent("");
      setImageUrl("");
      setUploadKey((previous) => previous + 1);

      setMessage("Post published successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="create-post ss-composer"
      onSubmit={handleSubmit}
    >
      {/* Composer header */}
      <div className="ss-composer-header">
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Your profile"
            className="ss-composer-avatar"
          />
        ) : (
          <div className="ss-composer-avatar ss-composer-placeholder">
            👤
          </div>
        )}

        <div>
          <h3>Create a post</h3>
          <p>Share a moment with your community</p>
        </div>
      </div>

      {/* Post text */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`What's on your mind, ${user?.username || "friend"}?`}
        maxLength={1000}
        rows={4}
        disabled={submitting}
        aria-label="Post content"
      />

      <div className="ss-composer-count">
        {content.length}/1000 characters
      </div>

      {/* Image upload */}
      <div className="ss-composer-media">
        <div className="ss-media-heading">
          <span>📷 Add a photo</span>
          <small>JPEG, PNG or WebP · Max 5 MB</small>
        </div>

        <ImageUpload
          key={uploadKey}
          token={token}
          onUploaded={setImageUrl}
        />

        {imageUrl && (
          <p className="ss-image-ready">
            ✓ Image uploaded and ready to publish
          </p>
        )}
      </div>

      {/* Publish */}
      <div className="ss-composer-footer">
        <span className="ss-composer-hint">
          Share something worth remembering ✨
        </span>

        <button
          type="submit"
          className="ss-publish-btn"
          disabled={
            submitting ||
            (!content.trim() && !imageUrl)
          }
        >
          {submitting ? "Publishing..." : "Publish Post"}
        </button>
      </div>

      {message && (
        <p className="ss-composer-message" role="status">
          {message}
        </p>
      )}
    </form>
  );
}

export default CreatePost;
