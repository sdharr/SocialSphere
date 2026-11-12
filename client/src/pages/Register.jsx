
import { useState } from "react";
import { Link, useNavigate } from "react-router";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      // Registration successful.
      // Continue to the Login page.
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ss-auth-page">
      <div className="ss-auth-layout ss-register-layout">

        {/* Left branding panel */}
        <section className="ss-auth-showcase">
          <Link to="/" className="ss-auth-brand">
            <span className="ss-auth-brand-icon">S</span>
            SocialSphere
          </Link>

          <div className="ss-auth-showcase-content">
            <span className="ss-auth-eyebrow">
              START YOUR JOURNEY
            </span>

            <h1>
              Your story
              <br />
              starts
              <br />
              <span>here.</span>
            </h1>

            <p>
              Join a community where every moment
              matters. Share your experiences,
              discover new people, and make
              meaningful connections.
            </p>

            <div className="ss-auth-features">
              <div>✦ Create your personal profile</div>
              <div>✦ Share posts and photos</div>
              <div>✦ Connect and chat in real time</div>
            </div>
          </div>

          <p className="ss-auth-showcase-footer">
            Your community starts here.
          </p>
        </section>

        {/* Right registration panel */}
        <section className="ss-auth-form-panel">
          <div className="ss-login-card ss-register-card">

            <div className="ss-login-heading">
              <span className="ss-login-label">
                JOIN THE COMMUNITY
              </span>

              <h2>Create your account</h2>

              <p>
                Start connecting, sharing, and
                discovering with SocialSphere.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="ss-login-form"
            >

              {/* Username */}
              <div className="ss-login-field">
                <label htmlFor="register-username">
                  Username
                </label>

                <input
                  id="register-username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                  maxLength={30}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="ss-login-field">
                <label htmlFor="register-email">
                  Email address
                </label>

                <input
                  id="register-email"
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

              {/* Password */}
              <div className="ss-login-field">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="ss-password-field">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    minLength={6}
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

                <small className="ss-register-hint">
                  At least 6 characters
                </small>
              </div>

              {/* Confirm Password */}
              <div className="ss-login-field">
                <label htmlFor="register-confirm">
                  Confirm password
                </label>

                <input
                  id="register-confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Error */}
              {error && (
                <p
                  className="ss-login-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {/* Register button */}
              <button
                type="submit"
                className="ss-login-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            <div className="ss-login-register">
              Already have an account?{" "}
              <Link to="/login">
                Sign in
              </Link>
            </div>

            <p className="ss-login-bottom">
              Connect. Share. Belong.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
