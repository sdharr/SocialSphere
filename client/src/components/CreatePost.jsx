
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import ImageUpload from "./ImageUpload";

function CreatePost({ onPostCreated }) {
  const { token } = useContext(AuthContext);

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadKey, setUploadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();


if (!content.trim() && !imageUrl) {
  setMessage("Please add text or an image to your post.");
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
        throw new Error(data.message || "Failed to create post");
      }

      const newPost = data.post || data;
      onPostCreated(newPost);

      setContent("");
      setImageUrl("");
      setUploadKey((previous) => previous + 1);
      setMessage("Post created successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <h3>Create a Post</h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows="4"
        disabled={submitting}
      />

      <ImageUpload
        key={uploadKey}
        token={token}
        onUploaded={setImageUrl}
      />

      {imageUrl && <p>✅ Image ready to publish!</p>}

      {message && <p>{message}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
}

export default CreatePost;
