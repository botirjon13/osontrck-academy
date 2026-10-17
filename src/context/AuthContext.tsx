import { useEffect, useState } from "react";
import { ApiError, fetchCurrentUser } from "../lib/api";
import type { CurrentUser } from "../lib/api";
import { AuthContext, type AuthStatus } from "./auth-context";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    localStorage.getItem("token") ? "loading" : "unauthenticated"
  );
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    let active = true;
    fetchCurrentUser(token)
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        if (loadError instanceof ApiError && loadError.status === 401) {
          localStorage.removeItem("token");
          setStatus("unauthenticated");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Profilni tekshirish amalga oshmadi."
        );
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (token: string) => {
    setStatus("loading");
    setError(null);

    try {
      const currentUser = await fetchCurrentUser(token);
      localStorage.setItem("token", token);
      setUser(currentUser);
      setStatus("authenticated");
    } catch (loginError) {
      setUser(null);
      setStatus("unauthenticated");
      throw loginError;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
