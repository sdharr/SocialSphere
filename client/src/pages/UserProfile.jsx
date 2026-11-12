
import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router";
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

  const currentUserId = user?._id || user?.id;

  // Load the user's profile and posts
  useEffect(() => {
    if (!id || !token) return;

    const controller = new AbortController();

    const fetchProfile = async () => {
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

        if (!controller.signal.aborted) {
          setProfile(profileData.user);
          setPosts(postsData.posts || []);
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

    fetchProfile();

    return () => controller.abort();
  }, [id, token]);

  // Follow or unfollow the user
  const handleFollow = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    setFollowError("");

    try {
      const response = await fetch(
        `/api/users/${id}/follow`,
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
          data.message || "Follow action failed"
        );
      }

      setProfile((previous) => ({
        ...previous,
        isFollowing: data.following,
        followersCount: data.followersCount,
      }));
    } catch (err) {
      setFollowError(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  if (error) return <p role="alert">{error}</p>;

  if (!profile) return <p>User not found.</p>;

  const profileUserId = profile._id || profile.id || id;
  const isOwnProfile =
    String(currentUserId) === String(profileUserId);

  return (
    <div className="profile-container ss-profile-page ss-public-profile">

      {/* Cover banner */}
      <div className="ss-profile-cover">
        <span>SOCIALSPHERE / COMMUNITY</span>
      </div>

      {/* Profile header */}
      <section className="ss-profile-intro">

        <div className="ss-public-avatar">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={`${profile.username}'s profile`}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar avatar-placeholder">
              👤
            </div>
          )}
        </div>

        <div className="ss-profile-details">
          <span className="ss-profile-label">
            COMMUNITY MEMBER
          </span>

          <h1>@{profile.username}</h1>

          <p className="ss-profile-bio">
            {profile.bio || "No bio added yet."}
          </p>

          <p className="ss-profile-joined">
            Joined{" "}
            {profile.joinedAt
              ? new Date(
                  profile.joinedAt
                ).toLocaleDateString()
              : "Recently"}
          </p>

          {/* Follow and Message buttons */}
          {!isOwnProfile && (
            <div className="profile-actions">

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

              <Link
                to={`/messages?userId=${profileUserId}`}
                className="message-profile-btn"
              >
                💬 Message
              </Link>

            </div>
          )}

          {followError && (
            <p role="alert">{followError}</p>
          )}
        </div>
      </section>

      {/* Profile statistics */}
      <div className="ss-profile-stats">
        <div className="ss-stat-card">
          <strong>{posts.length}</strong>
          <span>Posts shown</span>
        </div>

        <div className="ss-stat-card">
          <strong>
            {profile.followersCount ?? 0}
          </strong>
          <span>Followers</span>
        </div>

        <div className="ss-stat-card">
          <strong>
            {profile.followingCount ?? 0}
          </strong>
          <span>Following</span>
        </div>
      </div>

      {/* User posts */}
      <section className="profile-posts ss-profile-posts">
        <div className="ss-profile-posts-heading">
          <h2>Posts</h2>
          <span>{posts.length} displayed</span>
        </div>

        {posts.length === 0 ? (
          <p>This user hasn't posted anything yet.</p>
        ) : (
          posts.map((post) => (
            <div
              className="post-card"
              key={post._id}
            >
              {post.content && (
                <p>{post.content}</p>
              )}

              {post.image && (
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="post-image"
                  loading="lazy"
                />
              )}

              <small>
                {new Date(
                  post.createdAt
                ).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </section>

    </div>
  );
}

export default UserProfile;
