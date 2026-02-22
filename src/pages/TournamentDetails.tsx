/* eslint-disable @typescript-eslint/no-unused-vars */
import Cookies from "js-cookie";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import Navigation from "../components/shared/Navigation";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaRegShareFromSquare } from "react-icons/fa6";
import Info from "../components/Info";
import SchedulerView from "./SchedulerView";
import Score from "./Score";
import { useUser } from "../context/UserContext";

const TournamentDetails = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = Cookies.get("session_key");
  const [tabs, setTabs] = useState(0);
  const [loading, setLoading] = useState<{
    get: boolean;
    participate: boolean;
  }>({
    get: true,
    participate: false,
  });
  const [tournament, setTournament] = useState<{
    tournament: any;
    participantsCount: number;
    isParticipating: boolean;
    participants: Participant[];
  }>({
    tournament: {},
    participantsCount: 0,
    isParticipating: false,
    participants: [],
  });

  const getTournamentById = async () => {
    setLoading({ ...loading, get: true });
    try {
      const response = await api.get(
        `/api/v1/public/participate/tournament?tournamentId=${tournamentId}&userId=${user?._id}`
      );
      if (response.status === 200 && !response?.data?.error) {
        setTournament(response?.data?.tournament);
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.log(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, get: false });
    }
  };

  useEffect(() => {
    if (!tournamentId) navigate("/");
    else {
      getTournamentById();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session, tournamentId]);

  const onParticipate = async (id: string) => {
    setLoading({ ...loading, participate: true });
    try {
      const response = await api.post(`/api/v1/user/participate`, {
        tournament: id,
      });
      if (
        response.status === 201 &&
        !response?.data?.error &&
        response?.data?.code === "SUCCESS"
      ) {
        getTournamentById();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, participate: false });
    }
  };

  const onLeaveTournament = async (id: string) => {
    setLoading({ ...loading, participate: true });
    try {
      const response = await api.post(`/api/v1/user/participate/leave`, {
        tournament: id,
      });
      if (
        response.status === 200 &&
        !response?.data?.error &&
        response?.data?.code === "SUCCESS"
      ) {
        getTournamentById();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, participate: false });
    }
  };

  return (
    <Fragment>
      <Navigation />

      <section className="container md:py-8 py-6 max-w-[1200px]">
        {/* Back Button */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex justify-center items-center gap-2 text-sm"
          >
            <IoMdArrowRoundBack />
            Go back
          </button>
          <button
            onClick={() => {
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                  window.alert(
                    "URL copied to clipboard, you can share with friends."
                  );
                })
                .catch((err) => {
                  console.error("Failed to copy URL:", err);
                });
            }}
            className="flex justify-center items-center gap-2 text-sm"
          >
            <FaRegShareFromSquare />
            {t("share")}
          </button>
        </div>

        {/* Logo and name */}
        <div className="flex items-center md:mt-6 mt-6 gap-4">
          {loading.get ? (
            <>
              <aside className="rounded-lg p-1 bg-gray-200 w-[40px] h-[40px]">
                <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg" />
              </aside>
              <div className="h-8 w-1/3 rounded animate-pulse bg-gray-200" />
            </>
          ) : (
            <>
              <aside className="rounded-lg p-1 bg-[#E4DBCC] w-[40px] h-[40px] overflow-hidden ">
                <img
                  src={
                    tournament?.tournament?.logo !== ""
                      ? tournament?.tournament?.logo
                      : "/logo.png"
                  }
                  alt="Logo"
                  className="overflow-hidden w-full h-full object-contain"
                />
              </aside>
              <h1 className="font-semibold capitalize font-primary md:text-[26px] text-lg text-brand-black">
                {tournament?.tournament?.name}
              </h1>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto bg-tab rounded-lg max-w-max mt-4">
          <div className="inline-flex p-1 space-x-1 whitespace-nowrap h-[40px]">
            {["info", "schedule", "results"].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setTabs(index)}
                className={`h-full px-4 capitalize rounded-lg text-brand-black font-primary md:text-base text-sm ${
                  index === tabs ? "bg-white shadow-tab" : ""
                }`}
                disabled={loading.get}
              >
                {t(tab)}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr className="w-full my-6" />

        {/* Info */}
        {tabs === 0 && (
          <Info
            tournament={tournament}
            onParticipate={onParticipate}
            loading={loading?.participate}
            getLoading={loading?.get}
            onLeaveTournament={onLeaveTournament}
          />
        )}
        {tabs === 1 && <SchedulerView id={tournamentId} />}
        {tabs === 2 && <Score id={tournamentId} tournament={tournament} />}
      </section>
    </Fragment>
  );
};

export default TournamentDetails;
