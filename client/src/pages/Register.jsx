
import { useState } from "react";
import { Link } from "react-router";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("Creating account...");

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Registration failed");
      return;
    }

    setMessage("Account created successfully! You can now log in.");

    setFormData({
      username: "",
      email: "",
      password: "",
    });

  } catch (error) {
    console.error("Registration error:", error);
    setMessage("Cannot connect to the server.");
  }
};


  return (
    <div className="auth-container">
      <h1>Create Account</h1>
      <p>Join SocialSphere today!</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          minLength={8}
          required
        />

        <button type="submit">Sign Up</button>
      </form>

      <p role="status">{message}</p>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
