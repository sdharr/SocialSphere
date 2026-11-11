
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import AuthContext from "../context/AuthContext";


function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


const { login } = useContext(AuthContext);
const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("Logging in...");

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Login failed");
      return;
    }

    if (!data.token) {
      setMessage("Authentication token missing");
      return;
    }


// Save user and JWT in Auth Context
login(data.user, data.token);

// Redirect to homepage
navigate("/", { replace: true });


  } catch (error) {
    console.error("Login error:", error);
    setMessage("Cannot connect to the server.");
  }
};


  return (
    <div className="auth-container">
      <h1>Welcome Back!</h1>
      <p>Log in to SocialSphere</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p role="status">{message}</p>

      <p>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;
