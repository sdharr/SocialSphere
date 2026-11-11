
import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router";

function Search() {
  const { token } = useContext(AuthContext);

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    const searchTerm = query.trim();

    if (searchTerm.length < 2 || searchTerm.length > 30) {
      setError("Enter 2 to 30 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setUsers([]);
    setSearched(false);

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      setUsers(data.users);
      setSearched(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h1>Find People</h1>
      <p>Discover users on SocialSphere!</p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={30}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {searched && users.length === 0 && (
        <p>No users found.</p>
      )}

      <div className="search-results">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <h3>
  <Link to={`/users/${user._id}`}>
    {user.username}
  </Link>
</h3>
            <p>{user.bio || "No bio yet."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
