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

    <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
      <h2 className="text-xl font-bold">
        {t("playground.mission1")}
      </h2>

      <p className="text-gray-400 mt-3">
        {t("playground.mission1desc")}
      </p>

      <div className="mt-4 space-y-2 text-sm">
        <div>1️⃣ GET /health</div>
        <div>2️⃣ Try it out</div>
        <div>3️⃣ Execute</div>
        <div>4️⃣ Receive 200 OK</div>
      </div>

      <div className="mt-5 text-yellow-400 font-semibold">
        +10 XP
      </div>
        <button
          onClick={completeMission}
          className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-semibold transition"
        >
         {t("playground.complete")}
        </button>
    </div>

    <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="font-semibold">
        {t("playground.tip")}
      </h3>

      <p className="text-gray-400 text-sm mt-2">
        {t("playground.tipdesc")}
      </p>
    </div>
  </div>

  {/* Swagger */}
  <div className="flex-1">
    <iframe
      src="https://api.osontrack.uz/api/docs"
      title="Swagger"
      className="w-full h-full border-0"
    />
  </div>
</div>

);
}
