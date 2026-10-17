import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, error } = useAuth();

  if (status === "loading") {
    return <p role="status">Kirish tekshirilmoqda...</p>;
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

  return children;
}
