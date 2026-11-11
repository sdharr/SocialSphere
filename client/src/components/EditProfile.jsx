
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function EditProfile({ profile, onUpdated }) {
  const { token } = useContext(AuthContext);

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      onUpdated(data.user);
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername(profile.username);
    setBio(profile.bio || "");
    setEditing(false);
    setMessage("");
  };

  return (
    <div className="edit-profile">
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
        >
          Edit Profile
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="edit-username">Username</label>
          <input
            id="edit-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_]+"
            required
          />

          <label htmlFor="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      )}

      {message && <p role="status">{message}</p>}
    </div>
  );
}

export default EditProfile;
