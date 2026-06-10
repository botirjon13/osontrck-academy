import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "https://api-playground-backend-v8sd.onrender.com/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      alert("Invalid email or password");
      return;
    }

    const data = await response.json();

    localStorage.setItem(
      "token",
      data.access_token
    );

    login();

    navigate("/dashboard");
  } catch (error) {
    console.error(error);

    alert("Server error");
  }
};

  return (
    <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>

        <p className="text-gray-400 mb-8">
          Login to your OsonTrack Academy account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm">Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">Password</label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-yellow-400 hover:text-yellow-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
