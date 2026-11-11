
import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import EditProfile from "../components/EditProfile";
import PostActions from "../components/PostActions";

function Profile() {
  const { user, token, login } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile and posts
  useEffect(() => {
    const controller = new AbortController();

    const fetchProfileData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, postsResponse] =
          await Promise.all([
            fetch(`/api/users/${user.id}`, {
              headers,
              signal: controller.signal,
            }),
            fetch(`/api/posts/user/${user.id}`, {
              headers,
              signal: controller.signal,
            }),
          ]);

        if (!profileResponse.ok || !postsResponse.ok) {
          throw new Error("Failed to load profile data");
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

    if (user && token) {
      fetchProfileData();
    }

    return () => controller.abort();
  }, [user, token]);

  // Update profile information
  const handleProfileUpdated = (updatedUser) => {
    setProfile((previous) => ({
      ...previous,
      ...updatedUser,
    }));

    login({ ...user, ...updatedUser }, token);
  };

  // Update a post on screen
  const handlePostUpdated = (updatedPost) => {
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post._id === updatedPost._id
          ? updatedPost
          : post
      )
    );
  };

  // Remove deleted post from screen
  const handlePostDeleted = (deletedId) => {
    setPosts((previousPosts) =>
      previousPosts.filter(
        (post) => post._id !== deletedId
      )
    );
  };

  if (loading) return <p>Loading profile...</p>;

  if (error) return <p role="alert">{error}</p>;

  if (!profile) return <p>Profile not found.</p>;

  return (
    <div className="profile-container">
      <h1>{profile.username}</h1>

      <p>{profile.bio || "No bio added yet."}</p>

      <EditProfile
        profile={profile}
        onUpdated={handleProfileUpdated}
      />

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

      <div className="profile-posts">
        <h2>My Posts</h2>

        {posts.length === 0 ? (
          <p>You haven't created any posts yet.</p>
        ) : (
          posts.map((post) => (
            <div className="post-card" key={post._id}>
              <p>{post.content}</p>

              <small>
                {new Date(post.createdAt).toLocaleString()}
              </small>

              <PostActions
                post={post}
                onUpdated={handlePostUpdated}
                onDeleted={handlePostDeleted}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;
