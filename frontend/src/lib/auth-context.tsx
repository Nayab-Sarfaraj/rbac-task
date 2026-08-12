"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
}

interface AuthContextType {
  user: User | null;
  role: "admin" | "manager" | "member" | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = (accessToken: string, userData: User) => {
    setAccessToken(accessToken);
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("user_name", userData.name);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_name");
      }
      router.push("/login");
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      // Trigger a token refresh call
      const res = await api.post("/auth/refresh");
      const { accessToken: newAccessToken } = res.data.data;
      setAccessToken(newAccessToken);

      // Fetch me profile
      const meRes = await api.get("/auth/me");
      const payload = meRes.data.data;

      let storedName = "";
      if (typeof window !== "undefined") {
        storedName = localStorage.getItem("user_name") || "";
      }

      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: storedName || payload.email.split("@")[0],
      });
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
      setIsLoading(false);
    };

    initAuth();

    // Listen for axios interceptor logout event
    const handleLogoutEvent = () => {
      setAccessToken(null);
      setUser(null);
      router.push("/login");
    };

    window.addEventListener("auth-logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("auth-logout", handleLogoutEvent);
    };
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
