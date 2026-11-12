
import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    isActive ? "ss-nav-link active" : "ss-nav-link";

  return (
    <header className="ss-navbar">
      <div className="ss-nav-inner">

        <Link
          to="/"
          className="ss-brand"
          onClick={closeMenu}
        >
          <span className="ss-brand-icon">S</span>
          <span>SocialSphere</span>
        </Link>

        <button
          type="button"
          className="ss-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          className={`ss-nav-links ${menuOpen ? "open" : ""}`}
          aria-label="Main navigation"
        >
          {user ? (
            <>
              <NavLink
                to="/"
                end
                className={navClass}
                onClick={closeMenu}
              >
                Home
              </NavLink>

              <NavLink
                to="/search"
                className={navClass}
                onClick={closeMenu}
              >
                Discover
              </NavLink>

              <NavLink
                to="/messages"
                className={navClass}
                onClick={closeMenu}
              >
                Messages
              </NavLink>

              <NavLink
                to="/profile"
                className={navClass}
                onClick={closeMenu}
              >
                <span className="ss-nav-profile">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt=""
                      className="ss-nav-avatar"
                    />
                  ) : (
                    <span className="ss-nav-avatar ss-nav-placeholder">
                      👤
                    </span>
                  )}

                  <span>Profile</span>
                </span>
              </NavLink>

              <button
                type="button"
                className="ss-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={navClass}
                onClick={closeMenu}
              >
                Login
              </NavLink>

              <Link
                to="/register"
                className="ss-signup-btn"
                onClick={closeMenu}
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
