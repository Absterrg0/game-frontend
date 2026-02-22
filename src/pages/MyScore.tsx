import Cookies from "js-cookie";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/shared/Navigation";
import { Field, Label } from "@headlessui/react";
import { t } from "i18next";
import CustomSelect from "../components/shared/Select";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../components/shared/Table";
import api from "../lib/axios";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { IoFilter } from "react-icons/io5";
import { MdOutlineClear } from "react-icons/md";

type Props = {};

export interface UserGameScore {
  gameId: string;
  myScore: (number | "wo" | null)[];
  opponentScore: (number | "wo" | null)[];
  myDetails: {
    _id: string;
    name: string;
    email: string;
  };
  opponentDetails: {
    _id: string;
    name: string;
    email: string;
  };
  tournamentDetails: {
    name: string;
    _id: string;
  };
  createdAt: string; // ISO date string
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`} />
);

const RecordScore = (props: Props) => {
  const { user } = useUser();
  const session = Cookies.get("session_key");
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get("id");
  const [loading, setLoading] = useState(false);
  const [isFilter, setIsFilter] = useState(false);
  const [inputs, setInputs] = useState<{
    date: [Date | null, Date | null] | null;
    tournament: {
      value: string;
      label: string;
    } | null;
  }>({
    date: null,
    tournament: null,
  });
  const [games, setGames] = useState<UserGameScore[]>([]);
  const [userTournaments, setUserTournaments] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    if (!session) navigate("/auth/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session]);

  const getScores = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/api/v1/public/user-score`, {
        id,
        tournament: inputs?.tournament?.value,
        startDate: inputs?.date?.[0],
        endDate: inputs?.date?.[1],
      });
      if (response.status === 200) {
        setGames(response?.data?.games);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading(false);
    }
  };

  const getUserParticipatedTournaments = async () => {
    try {
      const response = await api.post(
        `/api/v1/public/user-participated-tournaments`,
        {
          id,
        }
      );
      if (response.status === 200) {
        setUserTournaments(response?.data?.tournaments);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.messages?.[0]);
    }
  };

  useEffect(() => {
    if (!id) return navigate("/");
    getUserParticipatedTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session]);

  useEffect(() => {
    if (!id) return navigate("/");
    getScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, inputs?.tournament, inputs?.date]);

  return (
    <Fragment>
      <Navigation />
      <section className="container md:py-8 py-6">
        {user && (
          <div className="flex justify-end">
            <Link to={"/about"} className="text-brand-primary">
              <span className="font-bold ">Skill Level: </span> <br />
              <span className="text-[#818080]">
                {user?.elo?.rating.toFixed(0)}
                <br />±{user?.elo?.rd.toFixed(0)}
              </span>
            </Link>
          </div>
        )}

        <div className="rounded-lg shadow-table border border-tableBorder mt-4 bg-white">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-primary font-medium text-brand-black capitalize">
                {t("my score")}
              </h1>
              <aside className="flex justify-center items-center gap-2">
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
                  className="px-4 h-[30px] md:w-max w-full rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
                >
                  {t("share")}
                </button>
                <button
                  onClick={() => setIsFilter(!isFilter)}
                  className="bg-white/60 rounded-lg flex justify-center items-center gap-2 text-sm px-4 h-[30px] border border-[#010A041F] text-brand-black"
                >
                  {!isFilter ? (
                    <>
                      <IoFilter />
                      Filter
                    </>
                  ) : (
                    <>
                      <MdOutlineClear />
                      Hide
                    </>
                  )}
                </button>
              </aside>
            </div>
            {isFilter && (
              <div className="grid grid-cols-2 justify-center items-center gap-4 mt-2">
                <Field className={"flex flex-col"}>
                  <Label className="text-brand-primary font-primary md:text-base text-sm block">
                    {t("date")}
                  </Label>
                  <ReactDatePicker
                    selected={
                      inputs?.date?.[0] ? new Date(inputs.date[0]) : null
                    }
                    onChange={(dates: [Date, Date]) => {
                      setInputs({ ...inputs, date: dates });
                    }}
                    startDate={
                      inputs?.date?.[0] ? new Date(inputs.date[0]) : null
                    }
                    endDate={
                      inputs?.date?.[1] ? new Date(inputs.date[1]) : null
                    }
                    selectsRange
                    placeholderText={t("date")}
                    className="w-full outline-none border-[#C6C4D5] border rounded-lg px-4 h-[36px] placeholder:text-[#818080]"
                    dateFormat="yyyy-MM-dd" // ✅ This formats the display to 2025-03-17
                    calendarClassName="custom-datepicker"
                    required
                    id="date"
                  />
                </Field>
                <Field>
                  <Label className="text-brand-primary font-primary md:text-base text-sm">
                    {t("tournament")}
                  </Label>
                  <CustomSelect
                    dropdownItems={userTournaments}
                    selectedOption={inputs?.tournament}
                    setSelectedOption={(e: any) =>
                      setInputs({ ...inputs, tournament: e })
                    }
                    placeholder={t("tournament")}
                    height="36px"
                    required
                    id="tournament"
                    className="md:col-span-2"
                  />
                </Field>
              </div>
            )}
            {(inputs?.tournament || inputs?.date) && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setInputs({ date: null, tournament: null })}
                  className="px-2 py-1 bg-red-600 text-sm text-white font-primary rounded-lg"
                >
                  {t("clear filter")}
                </button>
              </div>
            )}
          </div>

          <Table className="md:table hidden">
            <TableHeader>
              <TableHeaderRow className="grid w-full md:grid-cols-5 grid-cols-4">
                <TableHead className="md:text-sm text-xs">
                  {t("date")}
                </TableHead>
                <TableHead className="md:text-sm text-xs">
                  {t("tournament")}
                </TableHead>
                <TableHead className="md:text-sm text-xs">
                  {t("opponent")}
                </TableHead>
                <TableHead className="md:text-sm text-xs">
                  {t("my score")}
                </TableHead>
                <TableHead className="md:text-sm text-xs">
                  {t("opponent score")}
                </TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow
                      key={i}
                      className="grid w-full md:grid-cols-5 grid-cols-4"
                    >
                      <TableCell>
                        <Skeleton className="h-4 w-20 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 rounded" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Skeleton className="h-[25px] w-[25px] rounded" />
                          <Skeleton className="h-[25px] w-[25px] rounded" />
                          <Skeleton className="h-[25px] w-[25px] rounded" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Skeleton className="h-[25px] w-[25px] rounded" />
                          <Skeleton className="h-[25px] w-[25px] rounded" />
                          <Skeleton className="h-[25px] w-[25px] rounded" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  {games.length > 0 &&
                    games?.map((game) => (
                      <TableRow
                        className="grid w-full md:grid-cols-5 grid-cols-4"
                        key={game?.gameId}
                      >
                        <TableCell>
                          {game?.createdAt?.split("T")?.[0]}
                        </TableCell>
                        <TableCell>{game?.tournamentDetails?.name}</TableCell>
                        <TableCell>{game?.opponentDetails?.name}</TableCell>
                        <TableCell className="flex items-center">
                          {game?.myScore?.map((score, index) => {
                            const opponentScore = game?.opponentScore[index];
                            let isWonByMe = false;

                            if (
                              typeof score === "number" &&
                              typeof opponentScore === "number"
                            ) {
                              isWonByMe = score > opponentScore;
                            } else if (opponentScore === "wo") {
                              isWonByMe = true; // Opponent wins if myScore is 'wo'
                            } else if (
                              typeof score === "number" &&
                              opponentScore === null
                            ) {
                              isWonByMe = true;
                            }

                            return (
                              <Fragment key={index}>
                                <span
                                  className={`border rounded-md h-[25px] w-[25px] flex justify-center items-center ${
                                    isWonByMe
                                      ? "bg-brand-primary border-brand-primary text-white"
                                      : "border-brand-black/20"
                                  }`}
                                >
                                  {score === "wo"
                                    ? score
                                    : score === null
                                    ? "Won"
                                    : score}
                                </span>
                                {index < game.myScore.length - 1 && (
                                  <span className="mx-1">-</span>
                                )}
                              </Fragment>
                            );
                          })}
                        </TableCell>
                        <TableCell>
                          {game?.opponentScore?.map((score, index) => {
                            const myScore = game?.myScore[index];
                            let isWonByOpponent = false;

                            if (
                              typeof score === "number" &&
                              typeof myScore === "number"
                            ) {
                              isWonByOpponent = score > myScore;
                            } else if (myScore === "wo") {
                              // Check if myScore is 'wo'
                              isWonByOpponent = true; // Opponent wins if myScore is 'wo'
                            } else if (
                              typeof score === "number" &&
                              myScore === null
                            ) {
                              isWonByOpponent = true;
                            }

                            return (
                              <Fragment key={index}>
                                <span
                                  className={`border rounded-md h-[25px] w-[25px] flex justify-center items-center ${
                                    isWonByOpponent
                                      ? "bg-brand-primary border-brand-primary text-white"
                                      : "border-brand-black/20"
                                  }`}
                                >
                                  {score === "wo"
                                    ? score
                                    : score === null
                                    ? "Won"
                                    : score}
                                </span>
                                {index < game.opponentScore.length - 1 && (
                                  <span className="mx-1">-</span>
                                )}
                              </Fragment>
                            );
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  {games.length === 0 && (
                    <TableRow className="grid w-full p-2 rounded-b-xl text-center">
                      {t("no game found")}
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>

          {/* Mobile */}
          <div className="space-y-4 md:hidden p-4 pt-0">
            {loading &&
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 bg-[#010A040A] rounded-lg overflow-hidden grid grid-cols-1 gap-2"
                >
                  <Skeleton className="w-20 h-4 rounded mb-2" />
                  <Skeleton className="w-32 h-4 rounded mb-2" />
                  <Skeleton className="w-24 h-4 rounded mb-2" />
                  <div className="flex gap-1 mb-2">
                    <Skeleton className="h-[25px] w-[25px] rounded" />
                    <Skeleton className="h-[25px] w-[25px] rounded" />
                    <Skeleton className="h-[25px] w-[25px] rounded" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-[25px] w-[25px] rounded" />
                    <Skeleton className="h-[25px] w-[25px] rounded" />
                    <Skeleton className="h-[25px] w-[25px] rounded" />
                  </div>
                </div>
              ))}
            {!loading &&
              games.length > 0 &&
              games.map((game, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#010A040A] rounded-lg overflow-hidden grid grid-cols-1 gap-2"
                >
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold">{t("date")}:</span>
                    <span>{game?.createdAt?.split("T")?.[0]}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold">{t("tournament")}:</span>
                    <span>{game?.tournamentDetails?.name}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold">{t("opponent")}:</span>
                    <span>{game?.opponentDetails?.name}</span>
                  </div>
                  <div className="flex gap-2 items-center text-sm">
                    <span className="font-semibold">{t("my score")}:</span>
                    {game?.myScore?.map((score, idx) => {
                      const opponentScore = game?.opponentScore[idx];
                      let isWonByMe = false;
                      if (
                        typeof score === "number" &&
                        typeof opponentScore === "number"
                      ) {
                        isWonByMe = score > opponentScore;
                      } else if (opponentScore === "wo") {
                        isWonByMe = true;
                      } else if (
                        typeof score === "number" &&
                        opponentScore === null
                      ) {
                        isWonByMe = true;
                      }
                      return (
                        <span
                          key={idx}
                          className={`border rounded-md h-[25px] w-[25px] flex justify-center items-center mx-0.5 ${
                            isWonByMe
                              ? "bg-brand-primary border-brand-primary text-white"
                              : "border-brand-black/20"
                          }`}
                        >
                          {score === "wo"
                            ? score
                            : score === null
                            ? "Won"
                            : score}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 items-center text-sm">
                    <span className="font-semibold">
                      {t("opponent score")}:
                    </span>
                    {game?.opponentScore?.map((score, idx) => {
                      const myScore = game?.myScore[idx];
                      let isWonByOpponent = false;
                      if (
                        typeof score === "number" &&
                        typeof myScore === "number"
                      ) {
                        isWonByOpponent = score > myScore;
                      } else if (myScore === "wo") {
                        isWonByOpponent = true;
                      } else if (
                        typeof score === "number" &&
                        myScore === null
                      ) {
                        isWonByOpponent = true;
                      }
                      return (
                        <span
                          key={idx}
                          className={`border rounded-md h-[25px] w-[25px] flex justify-center items-center mx-0.5 ${
                            isWonByOpponent
                              ? "bg-brand-primary border-brand-primary text-white"
                              : "border-brand-black/20"
                          }`}
                        >
                          {score === "wo"
                            ? score
                            : score === null
                            ? "Won"
                            : score}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            {!loading && games.length === 0 && (
              <div className="p-4 bg-[#010A040A] rounded-lg overflow-hidden text-center">
                {t("no game found")}
              </div>
            )}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default RecordScore;
