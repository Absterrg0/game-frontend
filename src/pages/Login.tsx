import Google from "../components/icons/Google";
import Apple from "../components/icons/Apple";
import Cookies from "js-cookie";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaApple, FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

type Props = {};

const Login = (props: Props) => {
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
          {t("login")}
        </h1>
        <button
          onClick={() => {
            if (window)
              window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`;
          }}
          className="font-semibold border rounded-lg border-[#C6C4D5] active:animate-jerk text-brand-primary w-full mt-6 md:h-[48px] h-[40px] font-primary md:text-base text-sm hover:bg-white flex justify-center items-center gap-2"
        >
          <Google className="mr-2 h-[22px] w-[22px]" />
          {t("sign in with google")}
        </button>
        <button
          onClick={() => {
            if (window)
              window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/apple`;
          }}
          className="font-semibold border rounded-lg border-[#C6C4D5] active:animate-jerk text-brand-primary w-full mt-4 md:h-[48px] h-[40px] font-primary md:text-base text-sm hover:bg-white flex justify-center items-center gap-2"
        >
          <Apple className="mr-2 h-[22px] w-[22px]" />
          {t("sign in with apple")}
        </button>
      </div>
      <NavLink
        to={"/"}
        className="bg-brand-primary text-white text-xs py-2 px-4 rounded-md flex justify-center items-center gap-1 capitalize"
      >
        <FaArrowLeft />
        {t("back to home")}
      </NavLink>

      <div className="p-6 space-y-6 rounded-lg border border-tableBorder max-w-[580px] mx-auto shadow-table">
        <div>
          <h2 className="font-semibold text-base">
            What does sign in with apple or google mean?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Signing in with Apple or Google still gives you the option to use a
            different name and email with this app. You share no other
            information with this app that the email and name you enter this
            time.
          </p>
          <p className="mt-2 text-sm font-semibold">
            For more information visit:
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
              <FaApple />
              <h3 className="font-semibold">Apple Support</h3>
            </div>
            <a
              href="https://support.apple.com/en-us/102571"
              className="text-brand-primary text-sm hover:underline block mt-1"
            >
              Manage your apps with Sign in with Apple - Apple Support
            </a>
            <p className="text-sm text-gray-600 mt-1">
              When you use Sign in with Apple, you can use your Apple Account to
              sign in to participating apps and websites from developers other
              than Apple. Learn how to view and manage the apps that you use
              with Sign in with Apple.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <FcGoogle />

              <h3 className="font-semibold">Sign-in with Google</h3>
            </div>
            <a
              href="https://www.google.com/account/about/sign-in-with-google/"
              className="text-brand-primary text-sm hover:underline block mt-1"
            >
              Third Party Sign in with Google - Google Account
            </a>
            <p className="text-sm text-gray-600 mt-1">
              Third party login allows you to sign in with Google across
              multiple apps & sites. Stop password tracking & use your Google
              Account for a simpler sign in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
