import { createContext, useContext } from "react";
import type { CurrentUser } from "../lib/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export type AuthContextType = {
  status: AuthStatus;
  user: CurrentUser | null;
  error: string | null;
  login: (token: string) => Promise<void>;
  updateUser: (user: CurrentUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
