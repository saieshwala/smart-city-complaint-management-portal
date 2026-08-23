import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";
const TOKEN_KEY = "civicconnect_admin_token";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: unwrap API { data: ... } envelope and handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    // The API wraps responses in { data: ... } via TransformInterceptor.
    // Unwrap so consumers get the inner payload directly on response.data.
    if (response.data && typeof response.data === "object" && "data" in response.data && Object.keys(response.data).length === 1) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export const setAdminToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAdminToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export default apiClient;
