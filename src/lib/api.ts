import axios from "axios";

// Must use backend URL directly for cookies to work (browser sends cookies to same origin as cookie domain)
// Same env var as CRA: REACT_APP_BACKEND_URL (Vite exposes it via envPrefix in vite.config)
const baseURL = import.meta.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getBackendUrl = () => baseURL;
