import axios from "axios";

// Must use backend URL directly for cookies to work (browser sends cookies to same origin as cookie domain)
const envUrl = import.meta.env.VITE_BACKEND_URL;
const baseURL =
  envUrl || (import.meta.env.DEV ? "http://localhost:4000" : "");

if (import.meta.env.PROD && !envUrl) {
  throw new Error(
    "VITE_BACKEND_URL is required in production. Set it at build time."
  );
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getBackendUrl = () => baseURL;
