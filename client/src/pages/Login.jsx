
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to log in"
        );
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid login response");
      }

      login(data.user, data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ss-auth-page">
      <div className="ss-auth-layout">

        {/* Left branding panel */}
        <section className="ss-auth-showcase">
          <Link to="/" className="ss-auth-brand">
            <span className="ss-auth-brand-icon">S</span>
            SocialSphere
          </Link>

          <div className="ss-auth-showcase-content">
            <span className="ss-auth-eyebrow">
              YOUR COMMUNITY AWAITS
            </span>

            <h1>
              Connect.
              <br />
              Share.
              <br />
              <span>Belong.</span>
            </h1>

            <p>
              Your space to share moments, discover
              people, and stay connected with
              your community.
            </p>

            <div className="ss-auth-features">
              <div>✦ Share your favorite moments</div>
              <div>✦ Discover new connections</div>
              <div>✦ Chat with friends in real time</div>
            </div>
          </div>

          <p className="ss-auth-showcase-footer">
            A space for every story.
          </p>
        </section>

        {/* Right login panel */}
        <section className="ss-auth-form-panel">
          <div className="ss-login-card">
            <div className="ss-login-heading">
              <span className="ss-login-label">
                WELCOME BACK
              </span>

              <h2>Sign in to your account</h2>

              <p>
                Great to see you again! Enter your
                details to continue.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="ss-login-form"
            >
              <div className="ss-login-field">
                <label htmlFor="login-email">
                  Email address
                </label>

                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="ss-login-field">
                <label htmlFor="login-password">
                  Password
                </label>

                <div className="ss-password-field">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  className="ss-login-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="ss-login-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            <div className="ss-login-register">
              Don't have an account?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </div>

            <p className="ss-login-bottom">
              Connect with people. Share your world.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
