import Google from "../components/icons/google";
import Apple from "../components/icons/apple";
import Cookies from "js-cookie";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AppleIcon,
  ArrowLeft01Icon,
  GoogleIcon,
} from "@hugeicons/core-free-icons";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = Cookies.get("session_key");
  useEffect(() => {
    if (session) navigate("/");
  }, [navigate, session]);
  return (
    <section className="w-full flex justify-center items-center min-h-screen py-8 container flex-col gap-6">
      <div className="w-full max-w-[580px] rounded-lg border border-tableBorder px-6 py-10 shadow-table md:px-6 md:py-6 lg:px-14 lg:py-8">
        <h1 className="text-center font-primary text-[22px] font-bold capitalize text-brand-primary md:text-[26px]">
          {t("common.login")}
        </h1>
        <button
          onClick={() => {
            if (window)
              window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
          }}
          className="font-semibold border rounded-lg border-[#C6C4D5] active:animate-jerk text-brand-primary w-full mt-6 md:h-[48px] h-[40px] font-primary md:text-base text-sm hover:bg-white flex justify-center items-center gap-2"
        >
          <Google className="mr-2 h-[22px] w-[22px]" />
          {t("auth.signInWithGoogle")}
        </button>
        <button
          onClick={() => {
            if (window)
              window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/apple`;
          }}
          className="font-semibold border rounded-lg border-[#C6C4D5] active:animate-jerk text-brand-primary w-full mt-4 md:h-[48px] h-[40px] font-primary md:text-base text-sm hover:bg-white flex justify-center items-center gap-2"
        >
          <Apple className="mr-2 h-[22px] w-[22px]" />
          {t("auth.signInWithApple")}
        </button>
      </div>
      <NavLink
        to={"/"}
        className="bg-brand-primary text-white text-xs py-2 px-4 rounded-md flex justify-center items-center gap-1 capitalize"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        {t("auth.backToHome")}
      </NavLink>

      <div className="p-6 space-y-6 rounded-lg border border-tableBorder max-w-[580px] mx-auto shadow-table">
        <div>
          <h2 className="font-semibold text-base">
            {t("auth.whatDoesSignInMean")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("auth.signInExplanation")}
          </p>
          <p className="mt-2 text-sm font-semibold">
            {t("auth.forMoreInfo")}
          </p>
          <ul className="list-disc list-inside text-sm text-brand-primary">
            <li>
              <a
                href="https://support.apple.com/en-us/102571"
                className="hover:underline"
              >
                https://support.apple.com/en-us/102571
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com/account/about/sign-in-with-google/"
                className="hover:underline"
              >
                https://www.google.com/account/about/sign-in-with-google/
              </a>
            </li>
          </ul>
        </div>

        <div className="border-l-4 border-brand-primary pl-4 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={AppleIcon} size={16} />
              <h3 className="font-semibold">{t("auth.appleSupport")}</h3>
            </div>
            <a
              href="https://support.apple.com/en-us/102571"
              className="text-brand-primary text-sm hover:underline block mt-1"
            >
              {t("auth.appleSupportLink")}
            </a>
            <p className="text-sm text-gray-600 mt-1">
              {t("auth.appleSupportDescription")}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={GoogleIcon} size={16} />
              <h3 className="font-semibold">{t("auth.signInWithGoogleTitle")}</h3>
            </div>
            <a
              href="https://www.google.com/account/about/sign-in-with-google/"
              className="text-brand-primary text-sm hover:underline block mt-1"
            >
              {t("auth.googleAccountLink")}
            </a>
            <p className="text-sm text-gray-600 mt-1">
              {t("auth.googleAccountDescription")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;