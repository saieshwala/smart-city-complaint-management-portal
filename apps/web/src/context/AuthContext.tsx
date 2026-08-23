"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import apiClient from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "civicconnect_token";
const USER_KEY = "civicconnect_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Optionally verify the token with the server on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    apiClient
      .get("/auth/me")
      .then((res) => {
        const user = res.data.data?.user || res.data.user;
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      })
      .catch(() => {
        // Token may be expired; keep local state but mark as not loading
        setState((prev) => ({ ...prev, isLoading: false }));
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const data = res.data.data || res.data;
    const token = data.accessToken || data.token;
    const user = data.user;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const sendPhoneOtp = useCallback(async (phone: string) => {
    await apiClient.post("/auth/phone/send-otp", { phone });
  }, []);

  const loginWithOtp = useCallback(async (phone: string, otp: string) => {
    const res = await apiClient.post("/auth/phone/verify-otp", { phone, otp });
    const data = res.data.data || res.data;
    const token = data.accessToken || data.token;
    const user = data.user;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiClient.post("/auth/register", { name, email, password });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = "/login";
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      loginWithOtp,
      sendPhoneOtp,
      register,
      logout,
      getToken,
    }),
    [state, login, loginWithOtp, sendPhoneOtp, register, logout, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
