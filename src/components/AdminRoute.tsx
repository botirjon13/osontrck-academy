import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, user, error } = useAuth();

  if (status === "loading") {
    return <p role="status">Admin huquqi tekshirilmoqda...</p>;
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-[#020817] p-8 text-white">
        <p role="alert">{error}</p>
        <button className="mt-4 underline" onClick={() => window.location.reload()}>
          Qayta urinish
        </button>
      </main>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-[#020817] p-8 text-white">
        <h1 className="text-2xl font-bold">Ruxsat yo‘q</h1>
        <p className="mt-2 text-gray-300">
          Bu sahifaga faqat administrator kira oladi.
        </p>
        <Link className="mt-4 inline-block text-yellow-400 underline" to="/dashboard">
          O‘quvchi paneliga qaytish
        </Link>
      </main>
    );
  }

  return children;
}
