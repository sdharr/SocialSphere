
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router";
import AuthContext from "../context/AuthContext";

function UserProfile() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState("");

  // Fetch user profile and posts
  useEffect(() => {
    const controller = new AbortController();

    const fetchProfileData = async () => {
      setLoading(true);
      setError("");
      setProfile(null);
      setPosts([]);

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, postsResponse] =
          await Promise.all([
            fetch(`/api/users/${id}`, {
              headers,
              signal: controller.signal,
            }),

            fetch(`/api/posts/user/${id}`, {
              headers,
              signal: controller.signal,
            }),
          ]);

        if (!profileResponse.ok || !postsResponse.ok) {
          throw new Error("Failed to load user profile");
        }

        const profileData = await profileResponse.json();
        const postsData = await postsResponse.json();

        setProfile(profileData.user);
        setPosts(postsData.posts);
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
      fetchProfileData();
    }

    return () => controller.abort();
  }, [id, token]);

  // Follow or unfollow
  const handleFollow = async () => {
    setFollowLoading(true);
    setFollowError("");

    try {
      const response = await fetch(`/api/users/${id}/follow`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Follow action failed");
      }

      setProfile((previous) => ({
        ...previous,
        isFollowing: data.following,
        followersCount: data.followersCount,
      }));
    } catch (error) {
      setFollowError(error.message);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  if (error) return <p role="alert">{error}</p>;

  if (!profile) return <p>User not found.</p>;

  return (
    <div className="profile-container">
      <h1>{profile.username}</h1>

      <p>{profile.bio || "No bio added yet."}</p>

      {user?.id !== profile.id && (
        <button
          type="button"
          className="follow-btn"
          onClick={handleFollow}
          disabled={followLoading}
        >
          {followLoading
            ? "Please wait..."
            : profile.isFollowing
              ? "Unfollow"
              : "Follow"}
        </button>
      )}

      {followError && <p role="alert">{followError}</p>}

      <div className="profile-stats">
        <p>
          <strong>{profile.followersCount}</strong>
          Followers
        </p>

        <p>
          <strong>{profile.followingCount}</strong>
          Following
        </p>
      </div>

      <p>
        Joined: {new Date(profile.joinedAt).toLocaleDateString()}
      </p>

      {/* User Posts */}
      <div className="profile-posts">
        <h2>Posts</h2>

        {posts.length === 0 ? (
          <p>This user hasn't posted anything yet.</p>
        ) : (
          posts.map((post) => (
            <div className="post-card" key={post._id}>
              <p>{post.content}</p>

              <small>
                {new Date(post.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserProfile;
