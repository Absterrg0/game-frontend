import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

const Callback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const signup = queryParams.get("signup");
    const token = queryParams.get("token");
    const email = queryParams.get("email");
    const appleId = queryParams.get("apple_id");
    if (!signup && !token && !appleId) {
      navigate("/auth/login");
    } else if (signup === "true" && email && !token && !appleId) {
      // google sign up
      Cookies.set("email", email, {
        expires: 1,
        path: "/",
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      });
      navigate("/auth/user-information");
    } else if (signup === "true" && email && !token && appleId) {
      if (email)
        Cookies.set("email", email, {
          expires: 1,
          path: "/",
          secure: process.env.NODE_ENV === "production", // Only secure in production
          sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        });
      Cookies.set("appleId", appleId, {
        expires: 1,
        path: "/",
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      });
      navigate("/auth/user-information");
    } else if (token) {
      Cookies.set("session_key", token, {
        expires: 7,
        path: "/",
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      });
      window.location.href = "/";
    } else {
      navigate("/auth/login");
    }
  }, [navigate]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      {t("loading")}
    </div>
  );
};

export default Callback;
