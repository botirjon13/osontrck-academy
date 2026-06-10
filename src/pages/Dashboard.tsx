import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const logout = () => {
    logout();

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Dashboard
            </h1>

            <p className="text-gray-400 mt-2">
              Welcome to OsonTrack Academy
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-400 px-5 py-3 rounded-xl"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
