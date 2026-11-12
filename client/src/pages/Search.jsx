
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import AuthContext from "../context/AuthContext";

function Search() {
  const { user, token } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState("");

  const controllerRef = useRef(null);
  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    const query = searchTerm.trim();

    if (query.length < 2 || query.length > 30) {
      setError("Enter between 2 and 30 characters.");
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError("");
    setSearched(true);
    setLastSearch(query);
    setUsers([]);

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to search users"
        );
      }

      if (!controller.signal.aborted) {
        const results = (data.users || []).filter(
          (person) =>
            String(person._id) !== String(currentUserId)
        );

        setUsers(results);
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

  return (
    <main className="ss-discover-page">

      {/* Header */}
      <header className="ss-discover-header">
        <span className="ss-discover-eyebrow">
          DISCOVER YOUR COMMUNITY
        </span>

        <h1>Find your people.</h1>

        <p>
          Search for people, explore their profiles,
          and start meaningful conversations.
        </p>
      </header>

      {/* Search */}
      <form
        className="ss-discover-search"
        onSubmit={handleSearch}
        role="search"
      >
        <div className="ss-discover-input-wrap">
          <span aria-hidden="true">🔍</span>

          <input
            type="search"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search by username..."
            aria-label="Search users by username"
            minLength={2}
            maxLength={30}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p className="ss-discover-error" role="alert">
          {error}
        </p>
      )}

      {/* Search results */}
      <section className="ss-discover-results">
        {loading ? (
          <p className="ss-discover-status">
            Searching for people...
          </p>
        ) : !searched ? (
          <div className="ss-discover-empty">
            <span aria-hidden="true">👥</span>
            <h2>Discover new connections</h2>
            <p>
              Enter a username above to find
              people on SocialSphere.
            </p>
          </div>
        ) : error ? null : users.length === 0 ? (
          <div className="ss-discover-empty">
            <span aria-hidden="true">🔎</span>
            <h2>No users found</h2>
            <p>
              No matching users for "{lastSearch}".
              Try another username.
            </p>
          </div>
        ) : (
          <>
            <div className="ss-discover-results-header">
              <h2>People</h2>
              <span>
                {users.length} result
                {users.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="ss-discover-grid">
              {users.map((person) => {
                const personId =
                  person._id || person.id;

                return (
                  <article
                    className="ss-discover-card"
                    key={personId}
                  >
                    <div className="ss-discover-person">
                      {person.profilePicture ? (
                        <img
                          src={person.profilePicture}
                          alt={`${person.username}'s profile`}
                          className="ss-discover-avatar"
                        />
                      ) : (
                        <div className="ss-discover-avatar ss-discover-avatar-empty">
                          👤
                        </div>
                      )}

                      <div className="ss-discover-person-info">
                        <h3>@{person.username}</h3>

                        <p>
                          {person.bio ||
                            "Hello! I'm on SocialSphere."}
                        </p>
                      </div>
                    </div>

                    <div className="ss-discover-actions">
                      <Link
                        to={`/users/${personId}`}
                        className="ss-discover-profile-btn"
                      >
                        View Profile
                      </Link>

                      <Link
                        to={`/messages?userId=${personId}`}
                        className="ss-discover-message-btn"
                      >
                        💬 Message
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Search;
