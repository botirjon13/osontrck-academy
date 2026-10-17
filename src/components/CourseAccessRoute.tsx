import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { fetchMyCourses } from "../lib/api";

type AccessState = "checking" | "allowed" | "missing" | "error";
type AccessResult = {
  userId: string;
  state: Exclude<AccessState, "checking">;
  error?: string;
};

export default function CourseAccessRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, user } = useAuth();
  const [result, setResult] = useState<AccessResult | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (status !== "authenticated" || !user || !token) return;

    let active = true;
    fetchMyCourses(token)
      .then((enrollments) => {
        if (active) {
          setResult({
            userId: user.id,
            state: enrollments.length > 0 ? "allowed" : "missing",
          });
        }
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setResult({
          userId: user.id,
          state: "error",
          error: loadError instanceof Error
            ? loadError.message
            : "Kursga yozilganingizni tekshirish amalga oshmadi.",
        });
      });

    return () => {
      active = false;
    };
  }, [status, user, token]);

  const access: AccessState =
    status === "authenticated" && !token
      ? "error"
      : status === "authenticated" && user && result?.userId === user.id
        ? result.state
        : "checking";

  if (status === "loading" || access === "checking") {
    return <p role="status">Kursga kirish tekshirilmoqda...</p>;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  if (access === "error" || !token) {
    return (
      <main className="min-h-screen bg-[#020817] p-8 text-white">
        <p role="alert">
          {result?.error ?? "Kirish muddati tugagan. Iltimos, qayta kiring."}
        </p>
      </main>
    );
  }

  if (access === "missing") {
    return <Navigate to="/courses/rest-api-basics" replace />;
  }

  return children;
}
