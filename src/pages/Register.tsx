import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const { t } = useTranslation();

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://api-playground-backend-v8sd.onrender.com/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: name,
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        alert("Registration failed");
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
    <>
      <Header />

      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
          <h1 className="text-3xl font-bold mb-2">
            {t("register.title")}
          </h1>

          <p className="text-gray-400 mb-8">
            {t("register.subtitle")}
          </p>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >
            <div>
              <label className="block mb-2 text-sm">
                {t("register.fullName")}
              </label>

              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-500"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">
                {t("register.email")}
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-500"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">
                {t("register.password")}
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-500"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-xl transition"
            >
              {t("register.button")}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            {t("register.loginText")}{" "}
            <Link
              to="/login"
              className="text-yellow-400 hover:text-yellow-300"
            >
              {t("register.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
