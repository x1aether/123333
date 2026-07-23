"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, LoginCredentials, RegisterData } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials, redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData, redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      // Prevent auto-login right after a manual logout + redirect
      if (sessionStorage.getItem("auth_logged_out") === "1") {
        setUser(null);
        return;
      }

      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (credentials: LoginCredentials, redirectTo?: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || "Login failed" };
        }

        // Successful login clears any prior logout guard.
        sessionStorage.removeItem("auth_logged_out");
        setUser(data.user);

        // Redirect based on role — but honor an explicit redirect target for customers
        // (e.g. returning to /checkout after being prompted to log in).
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (redirectTo && redirectTo.startsWith("/")) {
          router.push(redirectTo);
        } else {
          router.push("/account");
        }

        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterData, redirectTo?: string) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (!res.ok) {
          return { success: false, error: json.error || "Registration failed" };
        }

        sessionStorage.removeItem("auth_logged_out");
        setUser(json.user);
        if (redirectTo && redirectTo.startsWith("/")) {
          router.push(redirectTo);
        } else {
          router.push("/account");
        }
        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      // Ensure server clears the auth cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }

    setUser(null);

    // Clear storage but PRESERVE UI preferences (theme + language) so logging
    // out does not reset the user's dark-mode/language choice.
    const preservedTheme = localStorage.getItem("eyecare-theme");
    const preservedLang = localStorage.getItem("eyecare-language");
    localStorage.clear();
    sessionStorage.clear();
    if (preservedTheme) localStorage.setItem("eyecare-theme", preservedTheme);
    if (preservedLang) localStorage.setItem("eyecare-language", preservedLang);
    // Re-set logout flag (sessionStorage was cleared)
    sessionStorage.setItem("auth_logged_out", "1");

    // Clear cookies (best-effort for any non-HTTPOnly cookies)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Immediate redirect
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
