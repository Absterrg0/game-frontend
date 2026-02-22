import { Link, useLocation } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CiLogout } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";

import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { ChangeEvent, useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import Cup from "../icons/Cup";
import Chart from "../icons/Chart";
import RecordScore from "../icons/RecordScore";
import Setting from "../icons/Setting";
import Sponsors from "../icons/Sponsors";
import Info from "../icons/Info";
import HamburgerIcon from "../icons/HamburgerIcon";
import { handleShare } from "../../pages/Settings";

const Navigation = () => {
  const location = useLocation();
  const { user } = useUser();
  const session = Cookies.get("session_key");
  const { t, i18n } = useTranslation();
  const lang = localStorage.getItem("lang");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const changeLanguage = (lang: string) => {
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    if (lang) i18n.changeLanguage(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <Fragment>
      <nav className="bg-brand-primary">
        <nav className="container flex justify-between items-center md:h-[66px] h-[50px]">
          <Link
            to="/"
            className="text-brand-white font-primary font-semibold flex justify-center items-end"
          >
            <img
              src="/TB10.svg"
              alt="Logo"
              className="object-contain md:h-[36px] h-[26px] pointer-events-none"
            />

            <p className="pl-2">v1.8</p>
          </Link>

          <div className="md:flex hidden justify-center items-center gap-8">
            <Link
              to="/"
              className="capitalize font-primary text-sm text-brand-white hover:opacity-80 active:animate-jerk flex justify-center items-center gap-1"
            >
              <Cup className="fill-brand-white" />
              {t("tournaments")}
            </Link>
            <Link
              to={`/my-score?id=${user?._id}`}
              className="capitalize font-primary text-sm text-brand-white hover:opacity-80 active:animate-jerk flex justify-center items-center gap-1"
            >
              <Chart className="fill-brand-white" />
              {t("my score")}
            </Link>
            <Link
              to="/record-score"
              className="capitalize font-primary text-sm text-brand-white hover:opacity-80 active:animate-jerk flex justify-center items-center gap-1"
            >
              <RecordScore className="fill-brand-white" />
              {t("record score")}
            </Link>
            <Link
              to="/settings"
              className="capitalize font-primary text-sm text-brand-white hover:opacity-80 active:animate-jerk flex justify-center items-center gap-1"
            >
              <Setting className="fill-brand-white" />
              {t("settings")}
            </Link>
            <Link
              to="/sponsors"
              className="capitalize font-primary text-sm text-brand-white hover:opacity-80 active:animate-jerk flex justify-center items-center gap-1"
            >
              <Sponsors className="fill-brand-white" />
              {t("sponsors")}
            </Link>
            <Link
              to="/about"
              className="capitalize font-primary text-sm text-brand-white hover:opacity-80 active:animate-jerk flex justify-center items-center gap-1"
            >
              <Info className="fill-brand-white" />
              {t("about")}
            </Link>
          </div>

          <div className="md:flex hidden justify-center items-center gap-2">
            <select
              defaultValue={String(lang)}
              className={
                "py-2 rounded-lg min-w-[90px] pl-1 font-primary text-sm border border-white/50 bg-transparent text-brand-white"
              }
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                changeLanguage(e.target.value)
              }
            >
              <option className="text-tb10TextStdBlack" value="en">
                EN
              </option>
              <option className="text-tb10TextStdBlack" value="de">
                DE
              </option>
            </select>
            {session ? (
              <button
                onClick={() => {
                  Cookies.remove("session_key");
                  navigate("/");
                }}
                className="px-4 py-2 rounded-lg capitalize bg-red-700 font-primary text-sm text-brand-white active:animate-jerk flex justify-center items-center gap-2"
              >
                <CiLogout size={20} />

                {t("logout")}
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/auth/login");
                }}
                className="px-4 py-2 rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
              >
                <img
                  src="/user.svg"
                  alt="user"
                  className="object-contain h-[17px] w-[17px] pointer-events-none"
                />
                {t("login")}
              </button>
            )}
          </div>

          {/* Hamburger */}
          <div className="md:hidden flex justify-center items-center gap-3">
            {session ? (
              <button
                onClick={() => {
                  Cookies.remove("session_key");
                  navigate("/");
                }}
                className="px-2 py-1 rounded-lg capitalize bg-red-700 font-primary text-sm text-brand-white active:animate-jerk flex justify-center items-center gap-2"
              >
                <CiLogout size={20} />

                {t("logout")}
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/auth/login");
                }}
                className="px-2 py-1 rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
              >
                <img
                  src="/user.svg"
                  alt="user"
                  className="object-contain h-[17px] w-[17px] pointer-events-none"
                />
                {t("login")}
              </button>
            )}
            <button onClick={toggleDrawer} className="active:animate-jerk">
              <HamburgerIcon className="stroke-brand-white" />
            </button>
          </div>
        </nav>
      </nav>

      <Drawer
        open={isOpen}
        onClose={toggleDrawer}
        direction="right"
        className="!w-[90%] !bg-white"
      >
        <div className="py-4 mx-4 flex justify-between items-center border-b border-brand-divider/10">
          <h2 className="text-brand-black text-xl font-primary font-semibold">
            Main Menu
          </h2>
          <button
            onClick={toggleDrawer}
            className="w-[25px] h-[25px] rounded-full flex justify-center items-center border border-black/20"
          >
            <IoCloseSharp />
          </button>
        </div>
        <div className="flex flex-col justify-between h-[calc(100%-62px)] w-full">
          <div className="p-4 flex flex-col gap-4 w-full">
            <Link
              to="/"
              className={`capitalize font-primary text-sm hover:opacity-80 active:animate-jerk flex items-center gap-3 ${
                location.pathname === "/"
                  ? "text-brand-primary"
                  : "text-brand-black"
              }`}
            >
              <Cup
                className={
                  location.pathname === "/"
                    ? "fill-brand-primary"
                    : "fill-brand-black"
                }
              />
              {t("tournaments")}
            </Link>
            <Link
              to={`/my-score?id=${user?._id}`}
              className={`capitalize font-primary text-sm hover:opacity-80 active:animate-jerk flex items-center gap-3 ${
                location.pathname === "/my-score"
                  ? "text-brand-primary"
                  : "text-brand-black"
              }`}
            >
              <Chart
                className={
                  location.pathname === "/my-score"
                    ? "fill-brand-primary"
                    : "fill-brand-black"
                }
              />
              {t("my score")}
            </Link>
            <Link
              to="/record-score"
              className={`capitalize font-primary text-sm hover:opacity-80 active:animate-jerk flex items-center gap-3 ${
                location.pathname.includes("/record-score")
                  ? "text-brand-primary"
                  : "text-brand-black"
              }`}
            >
              <RecordScore
                className={
                  location.pathname.includes("/record-score")
                    ? "fill-brand-primary"
                    : "fill-brand-black"
                }
              />
              {t("record score")}
            </Link>
            <Link
              to="/settings"
              className={`capitalize font-primary text-sm hover:opacity-80 active:animate-jerk flex items-center gap-3 ${
                location.pathname === "/settings"
                  ? "text-brand-primary"
                  : "text-brand-black"
              }`}
            >
              <Setting
                className={
                  location.pathname === "/settings"
                    ? "fill-brand-primary"
                    : "fill-brand-black"
                }
              />
              {t("settings")}
            </Link>
            <Link
              to="/sponsors"
              className={`capitalize font-primary text-sm hover:opacity-80 active:animate-jerk flex items-center gap-3 ${
                location.pathname === "/sponsors"
                  ? "text-brand-primary"
                  : "text-brand-black"
              }`}
            >
              <Sponsors
                className={
                  location.pathname === "/sponsors"
                    ? "fill-brand-primary"
                    : "fill-brand-black"
                }
              />
              {t("sponsors")}
            </Link>
            <Link
              to="/about"
              className={`capitalize font-primary text-sm hover:opacity-80 active:animate-jerk flex items-center gap-3 ${
                location.pathname === "/about"
                  ? "text-brand-primary"
                  : "text-brand-black"
              }`}
            >
              <Info
                className={
                  location.pathname === "/about"
                    ? "fill-brand-primary"
                    : "fill-brand-black"
                }
              />
              {t("about")}
            </Link>
            <select
              defaultValue={String(lang)}
              className={
                "py-2 rounded-lg min-w-[90px] pl-1 w-full font-primary text-sm border border-divider/50 bg-transparent text-brand-black"
              }
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                changeLanguage(e.target.value)
              }
            >
              <option className="text-tb10TextStdBlack" value="en">
                EN
              </option>
              <option className="text-tb10TextStdBlack" value="de">
                DE
              </option>
            </select>
            <button
              onClick={handleShare}
              className="bg-brand-secondary rounded-lg capitalize active:animate-jerk h-[36px] font-primary md:text-base text-sm flex justify-center items-center gap-2"
            >
              {t("invite friend")}
            </button>
          </div>
          <div className="p-4 space-y-3">
            {session ? (
              <button
                onClick={() => {
                  Cookies.remove("session_key");
                  navigate("/");
                }}
                className="px-4 py-2 rounded-lg w-full capitalize bg-red-700 font-primary text-sm text-brand-white active:animate-jerk flex justify-center items-center gap-2"
              >
                <CiLogout size={20} />

                {t("logout")}
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/auth/login");
                }}
                className="px-4 py-2 rounded-lg w-full bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
              >
                <img
                  src="/user.svg"
                  alt="user"
                  className="object-contain h-[17px] w-[17px] pointer-events-none"
                />
                {t("login")}
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </Fragment>
  );
};

export default Navigation;
