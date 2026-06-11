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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
              onClick={() =>
                window.open(
                  "https://api.osontrack.uz/api/docs",
                  "_blank"
                )
              }
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold"
            >
              {t("dashboard.playground")}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-400 px-5 py-3 rounded-xl font-semibold"
            >
              {t("dashboard.logout")}
            </button>
          </div>
        </div>

        {/* Mission Card */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold">
            {t("dashboard.mission1")}
          </h2>

          <p className="text-gray-400 mt-2">
            {t("dashboard.mission1desc")}
          </p>

          <button
            onClick={() =>
              window.open(
                "https://api.osontrack.uz/api/docs",
                "_blank"
              )
            }
            className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold"
          >
            {t("dashboard.startmission")}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold">
              {t("dashboard.swagger")}
            </h3>

            <p className="text-gray-400 text-sm mt-2">
              {t("dashboard.swaggerdesc")}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold">
              {t("dashboard.challenge")}
            </h3>

            <p className="text-gray-400 text-sm mt-2">
              {t("dashboard.challengedesc")}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-lg font-semibold">
              {t("dashboard.progress")}
            </h3>

            <p className="text-gray-400 text-sm mt-2">
              {t("dashboard.progressdesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
