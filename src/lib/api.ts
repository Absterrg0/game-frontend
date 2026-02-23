import axios from "axios";

// Must use backend URL directly for cookies to work (browser sends cookies to same origin as cookie domain)
const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getBackendUrl = () => baseURL;
