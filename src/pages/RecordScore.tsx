import Cookies from "js-cookie";
import React, { Fragment, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/shared/Navigation";
import { useTranslation } from "react-i18next";

type Props = {};

const MyScore = (props: Props) => {
  const { t } = useTranslation();
  const session = Cookies.get("session_key");
  const navigate = useNavigate();
  useEffect(() => {
    if (!session) navigate("/auth/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session]);
  return (
    <Fragment>
      <Navigation />
      <section className="container h-[calc(100vh-150px)] flex justify-center items-center">
        <div className="rounded-lg overflow-hidden shadow-table border border-tableBorder w-full max-w-xl">
          <div className="p-4 border-b border-tableBorder">
            <h1 className="text-brand-primary md:text-2xl text-xl font-primary font-semibold capitalize">
              {t("record score")}
            </h1>
          </div>
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/record-score/add"
              className="px-4 py-3 font-semibold w-full rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
            >
              {t("enter score")}
            </Link>
            <Link
              to="/record-score/validate"
              className="px-4 py-3 font-semibold w-full rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
            >
              {t("validate score")}
            </Link>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default MyScore;
