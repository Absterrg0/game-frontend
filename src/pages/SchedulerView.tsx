import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
} from "../components/shared/Table";
import api from "../lib/axios";
import { Dialog, DialogPanel, Field, Input, Label } from "@headlessui/react";
import { MdOutlineClose } from "react-icons/md";

type Props = {
  id: string | undefined;
};

export type GameDetails = {
  _id: string;
  playerOne: {
    _id: string;
    alias: string;
    name: string;
    email: string;
  };
  playerTwo: {
    _id: string;
    alias: string;
    name: string;
    email: string;
  };
  court: {
    _id: string;
    club: string;
    name: string;
    courtType: "grass" | "hard" | "clay"; // Add more types if needed
    placement: "indoor" | "outdoor"; // Adjust if there are other placements
    __v: number;
    createdAt: string; // ISO string date
    updatedAt: string; // ISO string date
  };
  score: number[];
  startTime: string; // ISO string date
  endTime: string; // ISO string date
  status: "active" | "inactive"; // Adjust as needed
  gameMode: "tournament" | "friendly"; // Add more modes if applicable
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  __v: number;
  round: number;
  currentRound: number;
  tournamentMode: "period" | "singleDay";
};

const SchedulerView: React.FC<Props> = ({ id }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [slots, setSlots] = useState<GameDetails[]>([]);
  const [updateScore, setUpdateScore] = useState(false);
  const [inputs, setInputs] = useState<{
    tournament: string;
    creatorScore: number | undefined;
    creator: string;
    validatorScore: number | undefined;
    validator: string;
  }>({
    tournament: "",
    creatorScore: 0,
    creator: "",
    validatorScore: 0,
    validator: "",
  });

  const getSlots = async () => {
    setLoading(true);

    try {
      const response = await api.post(
        `/api/v1/public/schedule-by-tournament-id`,
        {
          id,
        }
      );
      if (response?.status === 200) {
        setSlots(response?.data?.slots);
      }
    } catch (error: any) {
      console.log(
        error?.response?.data?.message || error?.response?.data?.messages?.[0]
      );
    } finally {
      setLoading(false);
    }
  };

  // const isAdmin = async () => {
  //   try {
  //     const response = await api.post(`/api/v1/user/is-admin`, {
  //       id,
  //     });
  //     if (response.status === 200) {
  //       setIsAdmin(response?.data?.isAdmin);
  //     }
  //   } catch (error: any) {
  //     console.log(error?.response?.data?.messages?.[0]);
  //   }
  // };

  useEffect(() => {
    if (!id) navigate("/");
    else {
      // isAdmin();
      getSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatDateTime(isoDate: string): string {
    if (!isoDate) return "";

    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) return "";

    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = (hours % 12 || 12).toString();
    const time = `${formattedHours}:${minutes} ${ampm}`;

    const date = dateObj.toISOString().split("T")[0];
    return `${time} (${date})`;
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await api.put("/api/v1/user/update-score", inputs);
      getSlots();
      setUpdateScore(false);
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setUpdateLoading(false);
    }
  };

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 ${className}`} />
  );

  return (
    <Fragment>
      <section className="rounded-lg overflow-hidden shadow-table border border-tableBorder">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-primary font-medium text-brand-black capitalize">
            {t("schedules")}
          </h1>
        </div>
        <Table>
          <TableHeader>
            <TableHeaderRow
              className={`grid w-full ${
                slots?.[0]?.tournamentMode === "period"
                  ? "grid-cols-2"
                  : "grid-cols-4"
              }`}
            >
              <TableHead className="md:text-sm text-xs">
                {t("players")}
              </TableHead>
              <TableHead
                className={`md:text-sm text-xs ${
                  slots?.[0]?.tournamentMode === "period" ? "hidden" : "flex"
                }`}
              >
                {t("court")}
              </TableHead>
              <TableHead className="md:text-sm text-xs">{t("round")}</TableHead>
              <TableHead
                className={`md:text-sm text-xs ${
                  slots?.[0]?.tournamentMode === "period" ? "hidden" : "flex"
                }`}
              >
                {t("time")}
              </TableHead>
            </TableHeaderRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <TableRow
                    key={i}
                    className={`grid w-full ${
                      slots?.[0]?.tournamentMode === "period"
                        ? "grid-cols-2"
                        : "grid-cols-4"
                    }`}
                  >
                    <TableCell>
                      <Skeleton className="h-4 w-32 rounded" />
                    </TableCell>
                    {slots?.[0]?.tournamentMode !== "period" && (
                      <TableCell>
                        <Skeleton className="h-4 w-24 rounded" />
                      </TableCell>
                    )}
                    <TableCell>
                      <Skeleton className="h-4 w-16 rounded" />
                    </TableCell>
                    {slots?.[0]?.tournamentMode !== "period" && (
                      <TableCell>
                        <Skeleton className="h-4 w-24 rounded" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              : slots?.map((item) => (
                  <TableRow
                    key={item?._id}
                    className={`grid w-full hover:bg-gray-300 ${
                      item?.tournamentMode === "period"
                        ? "grid-cols-2"
                        : "grid-cols-4"
                    }`}
                  >
                    <TableCell
                      className={`flex justify-start items-center ${
                        item?.currentRound !== item?.round && "text-[#B3B3B3]"
                      }`}
                    >
                      {item?.playerOne?.name}/{item?.playerTwo?.name}
                    </TableCell>
                    {item?.tournamentMode !== "period" && (
                      <TableCell
                        className={`flex justify-start items-center ${
                          item?.currentRound !== item?.round && "text-[#B3B3B3]"
                        }`}
                      >
                        {item?.court?.name}
                      </TableCell>
                    )}
                    <TableCell
                      className={`flex justify-start items-center ${
                        item?.currentRound !== item?.round && "text-[#B3B3B3]"
                      }`}
                    >
                      {item?.round}
                    </TableCell>
                    {item?.tournamentMode !== "period" && (
                      <TableCell
                        className={`flex justify-start items-center ${
                          item?.currentRound !== item?.round && "text-[#B3B3B3]"
                        }`}
                      >
                        {formatDateTime(item?.startTime)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </section>

      {/* Update Score */}
      <Dialog
        open={updateScore}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => {
          setUpdateScore(false);
        }}
      >
        <div className="fixed inset-0 z-10 bg-black/50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-xl relative rounded-lg bg-white backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <div className="flex justify-between p-4">
                <p className="text-xl text-brand-primary">Update Score</p>
                {/* close button */}
                <button
                  onClick={() => {
                    setUpdateScore(false);
                  }}
                  className="text-brand-primary hover:text-brand-primary/80 text-2xl"
                >
                  <MdOutlineClose />
                </button>
              </div>
              <form onSubmit={onSubmit} className="p-4">
                <Field>
                  <Label className="text-brand-primary font-primary md:text-base text-sm capitalize">
                    {t("player 1")} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    required
                    type="number"
                    name="creatorScore"
                    className="border px-4 font-normal rounded-lg border-[#C6C4D5] outline-brand-primary text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                    placeholder={t("enter player1 score")}
                    value={inputs.creatorScore}
                    onChange={handleInputChange}
                  />
                </Field>
                <Field className="mt-4">
                  <Label className="text-brand-primary font-primary md:text-base text-sm capitalize">
                    {t("player 2")}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    required
                    type="number"
                    name="validatorScore"
                    className="border px-4 font-normal rounded-lg border-[#C6C4D5] outline-brand-primary text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                    placeholder={t("enter player2 score")}
                    value={inputs.validatorScore}
                    onChange={handleInputChange}
                  />
                </Field>
                <button
                  disabled={updateLoading}
                  className="font-medium mt-6 bg-brand-primary border rounded-lg border-[#C6C4D5] active:animate-jerk text-white px-4 h-[40px] font-primary md:text-base text-sm flex justify-center items-center gap-2"
                >
                  {updateLoading ? t("saving") : t("save")}
                </button>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Fragment>
  );
};

export default SchedulerView;
