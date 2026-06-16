import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";

interface User {
  id: string;
  email: string;
  fullName: string;
  xp: number;
  mission1: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { logout } = useAuth();
  const { t } = useTranslation();

  const [user, setUser] = useState<User | null>(null);

  const [guideOpen, setGuideOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  
  const progress = Math.min((user?.xp ?? 0) / 2, 100);

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
            {user?.xp ?? 0} XP
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
          <span>{progress}%</span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="bg-yellow-500 h-3 rounded-full"
            style={{ width: `${progress}%` }}
          />
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

    {user?.mission1 ? (
      <div className="mt-4 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold inline-block">
        ✅ {t("dashboard.missionCompleted")}
      </div>
    ) : (
      <button
        onClick={() => navigate("/playground")}
        className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold"
      >
        {t("dashboard.startmission")}
      </button>
    )}

<div className="flex gap-3 mt-4">
  <button
    onClick={() => setGuideOpen(true)}
    className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl font-semibold"
  >
    📖 {t("dashboard.guide")}
  </button>

  <button
    onClick={() => setVideoOpen(true)}
    className="bg-red-600 hover:bg-red-500 px-5 py-3 rounded-xl font-semibold"
  >
    🎥 {t("dashboard.video")}
  </button>
</div>
      
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

{guideOpen && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-[#0f172a] max-w-3xl w-full rounded-2xl p-8 text-white">

      <h2 className="text-3xl font-bold mb-4">
        🚀 {t("dashboard.mission1Guide")}
      </h2>

      <p className="text-gray-400 mb-6">
         Ushbu missiyada siz:
      </p>

      <ul className="list-disc ml-5 text-gray-300 space-y-2">
        <li>REST API nima ekanligini tushunasiz</li>
        <li>JWT token bilan ishlaysiz</li>
        <li>Swagger orqali API chaqirasiz</li>
        <li>Authorization qanday ishlashini ko'rasiz</li>
      </ul>

      <div className="space-y-3 text-gray-300">
        <p>1️⃣ POST /auth/register Yangi account yarating.</p>
        <p>2️⃣ POST /auth/login Tizimga kiring va JWT token oling.</p>
        <p>3️⃣ Swagger Authorize Olingan JWT tokenni Swagger Authorize tugmasiga joylashtiring.</p>
        <p>4️⃣ GET /auth/profile Token ishlayotganini tekshiring.</p>
        <p>5️⃣ POST /challenges/complete/mission1 Missiyani yakunlang va 10 XP oling.</p>

        <p className="text-yellow-400 font-semibold">
          Mukofot: +10 XP
        </p>
      </div>

      <button
        onClick={() => setGuideOpen(false)}
        className="mt-6 bg-yellow-500 text-black px-5 py-3 rounded-xl"
      >
        {t("common.close")}
      </button>

    </div>
  </div>
)}

  {videoOpen && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

    <div className="bg-[#0f172a] rounded-2xl p-4 max-w-5xl w-full">

      <div className="flex justify-between mb-4">
        <h2 className="text-white font-bold">
          🎥 {t("dashboard.mission1Video")}
        </h2>

        <button
          onClick={() => setVideoOpen(false)}
          className="text-red-400"
        >
          ✕
        </button>
      </div>

      <div className="aspect-video">
        <iframe
          className="w-full h-full rounded-xl"
          alert("Video tez orada qo'shiladi");
          title="Mission 1"
          allowFullScreen
        />
      </div>

    </div>

  </div>
)}
  
</>
);
}
