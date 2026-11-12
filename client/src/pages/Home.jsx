
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";
import CreatePost from "../components/CreatePost";
import LikeButton from "../components/LikeButton";
import Comments from "../components/Comments";

function Home() {
  const { user, token } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add a newly created post to the feed
  const handlePostCreated = (newPost) => {
    const postWithAuthor = {
      ...newPost,
      author:
        newPost.author &&
          typeof newPost.author === "object"
          ? newPost.author
          : {
            _id: user._id || user.id,
            username: user.username,
            profilePicture: user.profilePicture || "",
          },
    };

    setPosts((previousPosts) => [
      postWithAuthor,
      ...previousPosts,
    ]);
  };

  // Fetch posts from MongoDB
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const fetchPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setPosts(data.posts || []);
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

    fetchPosts();

    return () => controller.abort();
  }, [token]);

  if (!user) {
    return (
      <div>
        <h1>Welcome to SocialSphere</h1>
        <p>
          Please <Link to="/login">login</Link> to view posts.
        </p>
      </div>
    );
  }

  const currentUserId = user._id || user.id;

  return (
    <div className="feed-container">
      <div className="feed-heading">
        <span className="feed-eyebrow">YOUR SOCIAL SPACE</span>

        <h1>Good to see you, {user.username}! 👋</h1>

        <p>See what's happening in your community.</p>
      </div>


      <CreatePost onPostCreated={handlePostCreated} />

      {loading && <p>Loading posts...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p>No posts yet.</p>
      )}

      {posts.map((post) => {
        const author = post.author;

        const authorId =
          author && typeof author === "object"
            ? author._id || author.id
            : author;

        const username =
          author && typeof author === "object"
            ? author.username || "Unknown user"
            : "Unknown user";

        const profilePicture =
          author && typeof author === "object"
            ? author.profilePicture
            : "";

        const profileLink =
          authorId === currentUserId
            ? "/profile"
            : `/users/${authorId}`;

        return (
          <div className="post-card" key={post._id}>

            {/* Post author's profile picture */}
            <div className="post-author-row">
              {authorId ? (
                <Link to={profileLink}>
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={`${username}'s profile`}
                      className="post-author-avatar"
                    />
                  ) : (
                    <div className="post-author-avatar post-avatar-placeholder">
                      👤
                    </div>
                  )}
                </Link>
              ) : (
                <div className="post-author-avatar post-avatar-placeholder">
                  👤
                </div>
              )}

              <div className="post-author-info">
                {authorId ? (
                  <Link to={profileLink}>
                    <strong>@{username}</strong>
                  </Link>
                ) : (
                  <strong>@{username}</strong>
                )}

                <small>
                  {new Date(post.createdAt).toLocaleString()}
                </small>
              </div>
            </div>

            {/* Post text */}
            {post.content && (
              <p>{post.content}</p>
            )}

            {/* Post image */}
            {post.image && (
              <img
                src={post.image}
                alt="Post attachment"
                className="post-image"
                loading="lazy"
              />
            )}

            {/* Like button */}
            <LikeButton post={post} />

            {/* Comments */}
            <Comments postId={post._id} />

          </div>
        );
      })}
    </div>
  );
}

export default Home;
