
import { useEffect, useRef, useState } from "react";

function ProfilePictureUpload({
  token,
  currentPicture,
  onUploaded,
}) {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    // Allow choosing the same file again.
    event.target.value = "";

    if (!file || uploading) return;

    setMessage("");
    setError(false);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPEG, PNG, or WebP image.");
      setError(true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5 MB.");
      setError(true);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload profile picture"
        );
      }

      if (!data.profilePicture) {
        throw new Error("Invalid upload response");
      }

      onUploaded(data.profilePicture);

      setMessage("Profile picture updated!");
      setError(false);
    } catch (err) {
      setMessage(err.message);
      setError(true);
    } finally {
      setPreview("");
      setUploading(false);
    }
  };

  const displayedPicture = preview || currentPicture;

  return (
    <div className="profile-picture-upload ss-avatar-editor">
      <div
        className="avatar-preview ss-avatar-frame"
        aria-busy={uploading}
      >
        {displayedPicture ? (
          <img
            src={displayedPicture}
            alt="Your profile"
            className="profile-avatar"
          />
        ) : (
          <div className="profile-avatar avatar-placeholder">
            👤
          </div>
        )}

        {/* Hidden file picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="ss-avatar-file-input"
          aria-label="Choose new profile picture"
          hidden
        />

        {/* Camera button */}
        <button
          type="button"
          className="ss-avatar-camera"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile picture"
          title="Change profile picture"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </button>
      </div>

      {uploading && (
        <p className="ss-avatar-status">
          Uploading picture...
        </p>
      )}

      {message && (
        <p
          className={`ss-avatar-status ${
            error ? "ss-avatar-error" : "ss-avatar-success"
          }`}
          role={error ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default ProfilePictureUpload;
