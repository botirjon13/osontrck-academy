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
<> <Header />

<div className="min-h-screen bg-[#020817] text-white p-10">
  <div className="max-w-6xl mx-auto">
    {/* Top Bar */}
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
            navigate("/playground")}
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

    {/* Hero Progress */}
    <div className="mt-10 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-8">
      <p className="text-gray-400">
        👋 {t("dashboard.welcome")} {user?.fullName}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {t("dashboard.path")}
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <p className="text-gray-400">
            {t("dashboard.xp")}
          </p>

          <h3 className="text-4xl font-bold text-yellow-400">
            0 XP
          </h3>
        </div>

        <div>
          <p className="text-gray-400">
            {t("dashboard.level")}
          </p>

          <h3 className="text-2xl font-semibold">
            {t("dashboard.beginner")}
          </h3>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{t("dashboard.progress")}</span>
          <span>5%</span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-3">
          <div className="bg-yellow-500 h-3 rounded-full w-[5%]" />
        </div>
      </div>
    </div>

    {/* Learning Path */}
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        {t("dashboard.learningpath")}
      </h2>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          🚀 {t("dashboard.restapi")}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          ⏳ {t("dashboard.postgresql")}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          ⏳ {t("dashboard.nestjs")}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          ⏳ {t("dashboard.jwt")}
        </div>
      </div>
    </div>

    {/* Mission Card */}
    <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-2xl font-bold">
        {t("dashboard.mission1")}
      </h2>

      <p className="text-yellow-400 mt-3">
        {t("dashboard.reward")} +10 XP
      </p>

      <p className="text-gray-400 mt-2">
        {t("dashboard.mission1desc")}
      </p>

      <button
        onClick={() =>
          navigate("/playground")
          }
        className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold"
      >
        {t("dashboard.startmission")}
      </button>
    </div>

    {/* Feature Cards */}
    <div className="grid md:grid-cols-3 gap-4 mt-6">
      <div
        onClick={() =>
          window.open(
            "https://api.osontrack.uz/api/docs",
            "_blank"
          )
        }
        className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-yellow-500 transition"
      >
        <h3 className="text-lg font-semibold">
          {t("dashboard.swagger")}
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          {t("dashboard.swaggerdesc")}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-yellow-500 transition">
        <h3 className="text-lg font-semibold">
          {t("dashboard.challenge")}
        </h3>

        <p className="text-gray-400 text-sm mt-2">
          {t("dashboard.challengedesc")}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-yellow-500 transition">
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
