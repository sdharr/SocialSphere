
import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";


function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <h2 className="navbar-logo">SocialSphere</h2>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        {user && <Link to="/search">Search</Link>}

        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/messages">Messages</Link>

            <span className="navbar-user">
              Hi, {user.username}
            </span>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
