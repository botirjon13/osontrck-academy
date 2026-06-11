import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";

interface User {
  id: string;
  email: string;
  fullName: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { logout } = useAuth();
  const { t } = useTranslation();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "https://api-playground-backend-v8sd.onrender.com/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();

    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[#020817] text-white p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                {t("dashboard.title")}
              </h1>

              <p className="text-gray-400 mt-2">
                {t("dashboard.welcome")} {user?.fullName}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                {user?.email}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/playground")}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold"
              >
                Open Playground
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-400 px-5 py-3 rounded-xl font-semibold"
              >
                {t("dashboard.logout")}
              </button>
            </div>
          </div>

          {/* Future Mission Card */}
          <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold">
              Mission #1
            </h2>

            <p className="text-gray-400 mt-2">
              Make your first API request using Swagger.
            </p>

            <button
              onClick={() => navigate("/playground")}
              className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold"
            >
              Start Mission
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
