
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

const handlePostCreated = (newPost) => {
  const postWithAuthor = {
    ...newPost,
    author: {
      _id: user.id,
      username: user.username,
    },
  };

  setPosts((previousPosts) => [
    postWithAuthor,
    ...previousPosts,
  ]);
};


  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const fetchPosts = async () => {
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
        setPosts(data.posts);
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

    fetchPosts();

    return () => controller.abort();
  }, [token]);

  if (!user) {
    return (
      <div>
        <h1>Welcome to SocialSphere</h1>
        <p>Please <Link to="/login">login</Link> to view posts.</p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <h1>Home Feed</h1>
      <CreatePost onPostCreated={handlePostCreated} />

      {loading && <p>Loading posts...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p>No posts yet.</p>
      )}

      {posts.map((post) => (

<div className="post-card" key={post._id}>
  <h3>{post.author?.username || "Unknown user"}</h3>

  <p>{post.content}</p>

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

  <LikeButton post={post} />
  <Comments postId={post._id} />
</div>

      ))}
    </div>
  );
}

export default Home;
