import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Create axios instance with CORS configuration
const api = axios.create({
  baseURL: '/api',
  headers: { 
    'Content-Type': 'application/json'
  }
});

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  message?: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError("");
      
      const data = {
        username,
        password
      };

      const response = await api.post<LoginResponse>("/auth/login/", data);
      console.log('Response:', response); // For debugging

      if (response.data.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        localStorage.setItem("refreshToken", response.data.refresh_token);
        navigate("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error('Login error:', error); // For debugging
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Login failed. Please try again.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Both fields are required.");
    } else {
      handleLogin(username, password);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-lg rounded-xl border border-gray-700">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Login to Roster Monster</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-400 text-center text-sm">{error}</p>
          </div>
        )}
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 focus:outline-none transition-colors"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 focus:outline-none transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none bg-transparent p-1 focus:bg-transparent active:bg-transparent"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0',
                  margin: '0',
                  cursor: 'pointer'
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
