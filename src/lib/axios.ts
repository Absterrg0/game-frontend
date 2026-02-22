import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL, // Adjust based on your API URL
  // withCredentials: true, // Allows cookies to be sent with requests
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = Cookies.get("session_key");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response, // If the response is successful, return it directly
  (error) => {
    if (error.response && error.response.status === 401) {
      // Delete the token if 401 Unauthorized error is received
      Cookies.remove("session_key");
      // Redirect to the login page
      window.location.href = "/auth/login";
    }
    return Promise.reject(error); // Reject the promise for other errors
  }
);

export default api;
