
import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import EditProfile from "../components/EditProfile";
import PostActions from "../components/PostActions";

import Comments from "../components/Comments";

import ProfilePictureUpload from "../components/ProfilePictureUpload";

function Profile() {
  const { user, token, login } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = user?._id || user?.id;

  // Load profile and posts
  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchProfileData = async () => {
      setLoading(true);
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, postsResponse] =
          await Promise.all([
            fetch(`/api/users/${userId}`, {
              headers,
              signal: controller.signal,
            }),
            fetch(`/api/posts/user/${userId}`, {
              headers,
              signal: controller.signal,
            }),
          ]);

        if (!profileResponse.ok || !postsResponse.ok) {
          throw new Error("Failed to load profile data");
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

    fetchProfileData();

    return () => controller.abort();
  }, [userId, token]);

  // Update username and bio
  const handleProfileUpdated = (updatedProfile) => {
    setProfile((previous) => ({
      ...previous,
      ...updatedProfile,
    }));

    login({ ...user, ...updatedProfile }, token);
  };

  // Update profile picture
  const handleAvatarUploaded = (imageUrl) => {
    setProfile((previous) => ({
      ...previous,
      profilePicture: imageUrl,
    }));

    login({ ...user, profilePicture: imageUrl }, token);
  };

  // Update a post on screen
  const handlePostUpdated = (updatedPost) => {
    setPosts((previous) =>
      previous.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  // Remove a deleted post
  const handlePostDeleted = (deletedId) => {
    setPosts((previous) =>
      previous.filter((post) => post._id !== deletedId)
    );
  };

  if (loading) return <p>Loading profile...</p>;

  if (error) return <p role="alert">{error}</p>;

  if (!profile) return <p>Profile not found.</p>;

  return (
    <div className="profile-container ss-profile-page">

      {/* Cover banner */}
      <div className="ss-profile-cover">
        <span>SOCIALSPHERE / MY SPACE</span>
      </div>

      {/* Profile header */}
      <section className="ss-profile-intro">
        <ProfilePictureUpload
          token={token}
          currentPicture={profile.profilePicture || ""}
          onUploaded={handleAvatarUploaded}
        />

        <div className="ss-profile-details">
          <span className="ss-profile-label">
            YOUR PROFILE
          </span>

          <h1>@{profile.username}</h1>

          <p className="ss-profile-bio">
            {profile.bio || "Tell people a little about yourself."}
          </p>

          <p className="ss-profile-joined">
            Joined{" "}
            {profile.joinedAt
              ? new Date(profile.joinedAt).toLocaleDateString()
              : "Recently"}
          </p>
        </div>
      </section>

      {/* Profile statistics */}
      <div className="ss-profile-stats">
        <div className="ss-stat-card">
          <strong>{posts.length}</strong>
          <span>Posts</span>
        </div>

        <div className="ss-stat-card">
          <strong>{profile.followersCount ?? 0}</strong>
          <span>Followers</span>
        </div>

        <div className="ss-stat-card">
          <strong>{profile.followingCount ?? 0}</strong>
          <span>Following</span>
        </div>
      </div>

      {/* Edit profile */}
      <section className="ss-profile-edit">
        <h2>Edit Your Profile</h2>
        <p>Update your username and bio.</p>

        <EditProfile
          profile={profile}
          onUpdated={handleProfileUpdated}
        />
      </section>

      {/* User posts */}
      <section className="profile-posts ss-profile-posts">
        <div className="ss-profile-posts-heading">
          <h2>My Posts</h2>
          <span>{posts.length} posts</span>
        </div>

        {posts.length === 0 ? (
          <p>You haven't created any posts yet.</p>
        ) : (
          posts.map((post) => (
            <div className="post-card" key={post._id}>

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
                {new Date(post.createdAt).toLocaleString()}
              </small>

              <PostActions
                post={post}
                onUpdated={handlePostUpdated}
                onDeleted={handlePostDeleted}
              />

<Comments postId={post._id} />

            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Profile;
