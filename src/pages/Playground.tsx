import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Playground() {
const navigate = useNavigate();
const { t } = useTranslation();
    
const completeMission = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "https://api.osontrack.uz/challenges/complete/mission1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      alert(`Mission completed! +${data.xp} XP`);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};

return ( <div className="h-screen bg-[#020817] text-white flex">
{/* Left Sidebar */} <div className="w-[380px] border-r border-white/10 p-6 flex flex-col">
<button
onClick={() => navigate("/dashboard")}
className="mb-6 text-left text-yellow-400 hover:text-yellow-300"
>
← {t("playground.back")} </button>

    <h1 className="text-3xl font-bold">
      {t("playground.title")}
    </h1>

    <p className="text-gray-400 mt-2">
      {t("playground.subtitle")}
    </p>

    <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
  <h2 className="text-2xl font-bold">
    🚀 {t("playground.mission1")}
  </h2>

  <p className="text-gray-400 mt-3">
    {t("playground.mission1desc")}
  </p>

  <div className="mt-6">
    <h3 className="font-semibold text-yellow-400 mb-3">
      📚 Nima o‘rganasiz?
    </h3>

    <ul className="space-y-2 text-sm text-gray-300">
      <li>✅ REST API nima ekanligini tushunasiz</li>
      <li>✅ Swagger bilan ishlaysiz</li>
      <li>✅ Endpoint yuborishni o‘rganasiz</li>
      <li>✅ Server javobini tekshirasiz</li>
    </ul>
  </div>

  <div className="mt-6">
    <h3 className="font-semibold text-yellow-400 mb-3">
      🪜 Bosqichlar
    </h3>

    <div className="space-y-3 text-sm">

      <div className="bg-white/5 rounded-lg p-3">
        1️⃣ GET /health endpointini oching
      </div>

      <div className="bg-white/5 rounded-lg p-3">
        2️⃣ Try it out tugmasini bosing
      </div>

      <div className="bg-white/5 rounded-lg p-3">
        3️⃣ Execute tugmasini bosing
      </div>

      <div className="bg-white/5 rounded-lg p-3">
        4️⃣ 200 OK javobi qaytganini tekshiring
      </div>

      <div className="bg-white/5 rounded-lg p-3">
        5️⃣ Missiyani yakunlash tugmasini bosing
      </div>

    </div>
  </div>

  <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
    <p className="text-yellow-400 font-bold text-xl">
      🎁 +10 XP
    </p>

    <p className="text-gray-400 text-sm mt-1">
      Birinchi missiyani muvaffaqiyatli tugatganingiz uchun mukofot.
    </p>
  </div>

  <button
    onClick={completeMission}
    className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-semibold transition"
  >
    ✅ {t("playground.complete")}
  </button>
</div>

<div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
  <h3 className="font-semibold mb-2">
    💡 {t("playground.tip")}
  </h3>

  <p className="text-gray-400 text-sm">
    Swagger ichida endpoint ustiga bosing →
    <span className="text-yellow-400"> Try it out </span>
    →
    <span className="text-yellow-400"> Execute </span>
    tugmalarini ketma-ket ishlating.
  </p>
</div>

);
}
