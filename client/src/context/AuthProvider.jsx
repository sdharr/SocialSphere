
import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("socialsphere_user");
      const savedToken = localStorage.getItem("socialsphere_token");

      if (!savedUser || !savedToken) return null;

      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("socialsphere_token") || null
  );

  const [checkingSession, setCheckingSession] = useState(
    () => Boolean(localStorage.getItem("socialsphere_token"))
  );

  const [sessionError, setSessionError] = useState("");

  // Save login information

const login = (userData, jwtToken) => {
  // Check whether this is a new login
  const tokenChanged = jwtToken !== token;

  setUser(userData);
  setToken(jwtToken);

  // Only verify the session when the token changes
  setCheckingSession(tokenChanged);
  setSessionError("");

  localStorage.setItem(
    "socialsphere_user",
    JSON.stringify(userData)
  );

  localStorage.setItem("socialsphere_token", jwtToken);
};

  // Remove login information
  const logout = () => {
    setUser(null);
    setToken(null);
    setCheckingSession(false);
    setSessionError("");

    localStorage.removeItem("socialsphere_user");
    localStorage.removeItem("socialsphere_token");
  };

  // Verify the JWT with our backend
  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }

    const controller = new AbortController();

    const verifySession = async () => {
      setCheckingSession(true);
      setSessionError("");

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        // Expired or invalid token
        if (response.status === 401 || response.status === 403) {
          if (!controller.signal.aborted) {
            logout();
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Session verification failed");
        }
      } catch (error) {
        if (
          error.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          console.error("Session error:", error.message);

          setSessionError(
            "Unable to verify your login. Check the backend and refresh."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingSession(false);
        }
      }
    };

    verifySession();

    return () => controller.abort();
  }, [token]);

  if (checkingSession) {
    return <p>Checking your session...</p>;
  }

  if (sessionError) {
    return <p>{sessionError}</p>;
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
