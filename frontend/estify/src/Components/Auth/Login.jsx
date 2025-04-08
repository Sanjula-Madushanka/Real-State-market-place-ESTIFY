import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const { data } = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });
      
      localStorage.setItem("token", data.token);
  
      // Decode and log the token (for debugging)
      const decoded = jwtDecode(data.token);
      console.log("Decoded Token (Frontend):", decoded);
  
      // Redirect based on role
      if (decoded.role === "admin") {
        navigate("/admin/bookings");
      } else {
        navigate("/properties");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-2xl rounded-2xl">
        
        {/* Logo Section */}
        <div className="flex justify-center">
          <img src="/logo.png" alt="Logo" className="w-20 h-20" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>

        {error && (
          <p className="text-red-600 bg-red-100 text-center py-2 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold text-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105 shadow-md"
          >
            Login
          </button>
        </form>

        {/* Sign-up link at the bottom */}
        <div className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500 font-semibold hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
