import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";

const configuredBaseUrl =
  rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
    ? rawBaseUrl
    : `https://${rawBaseUrl}`;

const api = axios.create({
  baseURL: configuredBaseUrl.replace(/\/+$/, ""),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
