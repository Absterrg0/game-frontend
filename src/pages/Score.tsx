import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "../components/shared/Table";
import { useTranslation } from "react-i18next";
import api from "../lib/axios";
import { FaEdit } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import FiveSetNormal from "../components/FiveSetNormal";
import OneSetNormal from "../components/OneSetNormal";
import ThreeSetNormal from "../components/ThreeSetNormal";
import ThreeTieBreak from "../components/ThreeTieBreak";
import TieBreak10OnlySet from "../components/TieBreak10OnlySet";

type Player = {
  _id: string;
  name: string;
  email: string;
  hmacKey: string;
};

type IScore = {
  playerOneScores: (number | "wo" | null)[];
  playerTwoScores: (number | "wo" | null)[];
};

type Tournament = {
  _id: string;
  name: string;
  playMode: "3set" | "5set" | string;
};

type Match = {
  _id: string;
  playerOne: Player;
  playerTwo: Player;
  court: string;
  tournament: Tournament;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: "active" | "completed" | "cancelled";
  gameMode: "tournament" | "friendly" | string;
  playMode: "3set" | "5set" | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  score: IScore;
};

type Props = {
  id: string | undefined;
  tournament: {
    tournament: any;
    participantsCount: number;
    isParticipating: boolean;
    participants: Participant[];
  };
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`} />
);

const Score: React.FC<Props> = ({ id, tournament }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<Match[]>([]);
  const [game, setGame] = useState<Match | null>(null);
  const [scoreId, setScoreId] = useState<string | null>(null);
  const [admin, setIsAdmin] = useState<boolean>(false);
  const [scores, setScores] = useState<{
    myScore: (string | number | null)[];
    opponentScore: (string | number | null)[];
  }>({
    myScore: [],
    opponentScore: [],
  });
  const [addScoreLoading, setAddScoreLoading] = useState(false);

  const getScores = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/api/v1/public/tournament-score`, {
        id,
      });
      if (response.status === 200) {
        setGames(response?.data?.games);
      }
    } catch (error: any) {
      setGames([]);
      console.log(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = async () => {
    try {
      const response = await api.post(`/api/v1/user/is-admin`, {
        id,
      });
      if (response.status === 200) {
        setIsAdmin(response?.data?.isAdmin);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.messages?.[0]);
    }
  };

  useEffect(() => {
    if (!id) return navigate("/");
    isAdmin();
    getScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addOrUpdateScore = async () => {
    if (!game?._id) return;
    const data = {
      gameId: game._id,
      scores: {
        [game?.playerOne?._id ?? ""]: {
          type: "playerOne",
          scores: scores.myScore,
        },
        [game?.playerTwo?._id ?? ""]: {
          type: "playerTwo",
          scores: scores.opponentScore,
        },
      },
    };
    setAddScoreLoading(true);
    try {
      const response = await api.post(
        "/api/v1/user/organizer/tournaments/score/update",
        data
      );
      if (response.status === 200) {
        // Optionally refresh scores or close dialog
        getScores();
        setScoreId(null);
        setGame(null);
        setScores({
          myScore: [],
          opponentScore: [],
        });
      }
    } catch (error: any) {
      // Optionally show error to user
      console.log(error?.response?.data?.messages?.[0]);
    } finally {
      setAddScoreLoading(false);
    }
  };

  return (
    <Fragment>
      <section className="rounded-lg overflow-hidden shadow-table border border-tableBorder">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-primary font-medium text-brand-black capitalize">
            {t("scores")}
          </h1>
        </div>
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableHeaderRow
                className={`grid ${
                  admin ? "grid-cols-5" : "grid-cols-4"
                } w-full`}
              >
                <TableHead className="md:text-sm text-xs whitespace-nowrap text-left">
                  {t("1st player")}
                </TableHead>
                <TableHead
                  className={`md:text-sm text-xs whitespace-nowrap text-left`}
                >
                  {t("2nd player")}
                </TableHead>
                <TableHead className="md:text-sm text-xs whitespace-nowrap text-left">
                  {t("1st score")}
                </TableHead>
                <TableHead
                  className={`md:text-sm text-xs whitespace-nowrap text-left`}
                >
                  {t("2nd score")}
                </TableHead>
                {admin && (
                  <TableHead
                    className={`md:text-sm text-xs whitespace-nowrap text-left`}
                  >
                    {t("actions")}
                  </TableHead>
                )}
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="grid w-full grid-cols-4">
                      <TableCell>
                        <Skeleton className="h-4 w-24 rounded" />
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
                        className={`grid w-full ${
                          admin ? "grid-cols-5" : "grid-cols-4"
                        }`}
                        key={game?._id}
                      >
                        <TableCell className="text-left">
                          {game?.playerOne?.name}
                        </TableCell>
                        <TableCell className="text-left">
                          {game?.playerTwo?.name}
                        </TableCell>
                        <TableCell className="text-left">
                          {game?.score?.playerOneScores?.map((score, index) => {
                            const opponentScore =
                              game?.score?.playerTwoScores?.[index];
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
                                {index <
                                  game?.score?.playerOneScores.length - 1 && (
                                  <span className="mx-1">-</span>
                                )}
                              </Fragment>
                            );
                          })}
                        </TableCell>
                        <TableCell className="text-left">
                          {game?.score.playerTwoScores?.map((score, index) => {
                            const myScore = game?.score.playerOneScores[index];
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
                                {index <
                                  game.score.playerTwoScores.length - 1 && (
                                  <span className="mx-1">-</span>
                                )}
                              </Fragment>
                            );
                          })}
                        </TableCell>
                        {admin && (
                          <TableCell className="text-left">
                            <Button
                              onClick={() => {
                                setScoreId(game._id);
                                setGame(game);
                                setScores({
                                  myScore: game.score.playerOneScores,
                                  opponentScore: game.score.playerTwoScores,
                                });
                              }}
                            >
                              <FaEdit />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  {games.length === 0 && (
                    <TableRow className="grid w-full rounded-b-xl text-center py-1">
                      {t("no game found")}
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Add/Edit Score */}
      <Dialog
        open={scoreId !== null}
        onClose={() => {}}
        className="relative z-50"
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <DialogBackdrop className="fixed inset-0 bg-black/30" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          {/* The actual dialog panel  */}
          <DialogPanel className="max-w-lg w-full bg-white rounded-xl shadow-table">
            <div className="p-4 border-b border-tableBorder flex justify-between items-start gap-4">
              <aside>
                <DialogTitle className="font-bold text-lg text-brand-black">
                  {t("Score Management")}
                </DialogTitle>
                <Description className="text-sm text-brand-black/70">
                  {t("You can add/update score here")}
                </Description>
              </aside>
              <button
                disabled={addScoreLoading}
                onClick={() => {
                  setScoreId(null);
                  setGame(null);
                  setScores({
                    myScore: [],
                    opponentScore: [],
                  });
                }}
                className="text-brand-black text-2xl"
              >
                <IoMdCloseCircleOutline />
              </button>
            </div>
            {/* Body */}
            <div className="px-4 py-6 border-b border-tableBorder">
              {tournament?.tournament?.playMode === "TieBreak10" && (
                <TieBreak10OnlySet
                  scores={scores}
                  setScores={setScores}
                  resetScores={() => {
                    setScores({
                      myScore: [],
                      opponentScore: [],
                    });
                  }}
                  myName={game?.playerOne?.name}
                  opponentName={game?.playerTwo?.name}
                />
              )}
              {tournament?.tournament?.playMode === "3setTieBreak10" && (
                <ThreeTieBreak
                  scores={scores}
                  setScores={setScores}
                  resetScores={() => {
                    setScores({
                      myScore: [],
                      opponentScore: [],
                    });
                  }}
                  myName={game?.playerOne?.name}
                  opponentName={game?.playerTwo?.name}
                />
              )}
              {tournament?.tournament?.playMode === "1set" && (
                <OneSetNormal
                  scores={scores}
                  setScores={setScores}
                  resetScores={() => {
                    setScores({
                      myScore: [],
                      opponentScore: [],
                    });
                  }}
                  myName={game?.playerOne?.name}
                  opponentName={game?.playerTwo?.name}
                />
              )}
              {tournament?.tournament?.playMode === "3set" && (
                <ThreeSetNormal
                  scores={scores}
                  setScores={setScores}
                  resetScores={() => {
                    setScores({
                      myScore: [],
                      opponentScore: [],
                    });
                  }}
                  myName={game?.playerOne?.name}
                  opponentName={game?.playerTwo?.name}
                />
              )}
              {tournament?.tournament?.playMode === "5set" && (
                <FiveSetNormal
                  scores={scores}
                  setScores={setScores}
                  resetScores={() => {
                    setScores({
                      myScore: [],
                      opponentScore: [],
                    });
                  }}
                  myName={game?.playerOne?.name}
                  opponentName={game?.playerTwo?.name}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 flex justify-end items-center gap-2">
              <button
                disabled={addScoreLoading}
                type="button"
                onClick={() => {
                  setScoreId(null);
                  setGame(null);
                  setScores({
                    myScore: [],
                    opponentScore: [],
                  });
                }}
                className="font-medium border-2 rounded-lg border-red-800 active:animate-jerk text-red-800 h-[36px] capitalize font-primary md:text-base text-sm px-4 flex justify-center items-center gap-2"
              >
                {t("cancel")}
              </button>
              <button
                disabled={addScoreLoading}
                onClick={addOrUpdateScore}
                type="submit"
                name="action"
                value="publish"
                className="font-medium px-4 bg-brand-primary border rounded-lg border-brand-primary active:animate-jerk text-white h-[36px] font-primary md:text-base text-sm flex justify-center items-center"
              >
                {addScoreLoading ? t("saving") : t("save")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Fragment>
  );
};

export default Score;
