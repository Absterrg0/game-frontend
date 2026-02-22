import React, { Fragment, useEffect, useState } from "react";
import Navigation from "../components/shared/Navigation";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import api from "../lib/axios";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Field, Input, Label, Switch } from "@headlessui/react";
import Loader from "../components/shared/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "../components/shared/Table";
import { IoMdArrowRoundBack } from "react-icons/io";

type Props = {};

interface Participant {
  _id: string;
  user: {
    name: string;
  };
  order: number;
}

interface RoundTiming {
  startDate: Date | null;
  endDate: Date | null;
}

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`} />
);

const Scheduler = (props: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = Cookies.get("session_key");
  const queryParams = new URLSearchParams(window.location.search);
  const tournamentId = queryParams.get("tournament");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [games, setGames] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<{
    get: boolean;
    getTournament: boolean;
    updateOrder: boolean;
    updateTiming: boolean;
    participate: string | null;
    scheduler: boolean;
  }>({
    get: false,
    getTournament: false,
    updateOrder: false,
    updateTiming: false,
    participate: null,
    scheduler: false,
  });
  const [inputs, setInputs] = useState<{
    playTime: string;
    pauseTime: string;
    numberOfRounds: string;
    currentRound: string;
    tournamentMode: string;
    numberOfGames: string;
    isAvoidListed: boolean;
  }>({
    pauseTime: "",
    playTime: "",
    numberOfRounds: "",
    currentRound: "",
    tournamentMode: "",
    numberOfGames: "",
    isAvoidListed: false,
  });
  const [roundTimings, setRoundTimings] = useState<RoundTiming[]>([]);

  const handleOnDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination) return;
    setLoading({ ...loading, updateOrder: true });
    // Reorder participants locally
    const reorderedItems = Array.from(participants);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    // Prepare the updated order for the backend (preserve _id and set order from 1..n)
    const updatedOrder = reorderedItems?.map((participant: any, index) => ({
      ...participant, // Copy the rest of the participant data
      order: index + 1, // Update the order
    }));

    try {
      const response = await api.patch(
        `/api/v1/user/tournament/${tournamentId}/participants/order`,
        {
          updatedOrder,
        }
      );
      if (response?.status === 200) setParticipants(updatedOrder);
    } catch (error: any) {
      console.error("Failed to update player's skill order", error);
      window.alert("Failed to update player's skill order");
      setParticipants(participants);
    } finally {
      setLoading({ ...loading, updateOrder: false });
    }
  };

  const getData = async () => {
    setLoading({ ...loading, get: true });

    try {
      const responses = await Promise.allSettled([
        api.get(`/api/v1/user/tournament/${tournamentId}/participants`),
        api.get(
          `/api/v1/public/participate/tournament?tournamentId=${tournamentId}`
        ),
        api.get(`/api/v1/user/tournament/games/${tournamentId}`),
      ]);

      // Handle participants response
      const participantsResult = responses[0];
      if (
        participantsResult.status === "fulfilled" &&
        participantsResult.value.status === 200 &&
        !participantsResult.value.data?.error
      ) {
        setParticipants(participantsResult.value.data.participants);
      }

      // Handle tournament details response
      const tournamentResult = responses[1];
      if (
        tournamentResult.status === "fulfilled" &&
        tournamentResult.value.status === 200 &&
        !tournamentResult.value.data?.error
      ) {
        setInputs({
          ...inputs,
          pauseTime:
            tournamentResult.value.data.tournament?.tournament?.pauseTime,
          playTime:
            tournamentResult.value.data.tournament?.tournament?.playTime,
          numberOfRounds:
            tournamentResult.value.data.tournament?.tournament?.numberOfRounds,
          tournamentMode:
            tournamentResult.value.data.tournament?.tournament?.tournamentMode,
        });
        if (
          tournamentResult.value.data.tournament?.tournament?.tournamentMode ===
          "period"
        ) {
          const times =
            tournamentResult.value.data.tournament?.tournament?.roundTimings?.map(
              (item: RoundTiming) => ({
                startDate: item?.startDate ? new Date(item.startDate) : null, // Use undefined instead of null
                endDate: item?.endDate ? new Date(item.endDate) : null,
              })
            );
          setRoundTimings(times);
        }
      }

      // Handle games response
      const gamesResult = responses[2];
      if (
        gamesResult.status === "fulfilled" &&
        gamesResult.value.status === 200 &&
        !gamesResult.value.data?.error
      ) {
        setGames(gamesResult.value.data.games);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading({ ...loading, get: false });
    }
  };

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
    if (name === "numberOfRounds") {
      setRoundTimings(
        Array.from({ length: Number(value) }, () => ({
          startDate: null,
          endDate: null,
        }))
      );
    }
  };

  const updateTiming = async () => {
    setLoading({ ...loading, updateTiming: true });
    try {
      const response = await api.patch(
        `/api/v1/user/tournament/${tournamentId}/timing`,
        { ...inputs, roundTimings }
      );
      if (response.status === 200 && !response?.data?.error) {
        getData();
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages[0]);
    } finally {
      setLoading({ ...loading, updateTiming: false });
    }
  };

  const onLeaveTournament = async (id: string | null, playId: string) => {
    try {
      const response = await api.post(`/api/v1/user/participate/${id}`, {
        playId,
      });
      if (
        response.status === 200 &&
        !response?.data?.error &&
        response?.data?.code === "SUCCESS"
      ) {
        window.location.reload();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, participate: null });
    }
  };

  const reSchedulerSlots = async (id: string | null, currentRound: string) => {
    setLoading({ ...loading, scheduler: true });
    try {
      const response = await api.post(`/api/v1/user/re-schedule`, {
        id,
        currentRound,
        tournamentMode: inputs?.tournamentMode,
        numberOfGames: inputs?.numberOfGames,
        isAvoidListed: inputs?.isAvoidListed,
      });
      if (response.status === 200) {
        window.location.reload();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, scheduler: false });
    }
  };

  const schedulerSlots = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading({ ...loading, scheduler: true });
    try {
      const response = await api.post(`/api/v1/user/schedule`, {
        id: tournamentId,
        currentRound: inputs?.currentRound,
        tournamentMode: inputs?.tournamentMode,
        numberOfGames: inputs?.numberOfGames,
        isAvoidListed: inputs?.isAvoidListed,
      });
      if (response.status === 200) {
        console.log(response?.data?.games);
        window.location.reload();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        if (window.confirm(error?.response?.data?.messages?.[0])) {
          reSchedulerSlots(tournamentId, inputs?.currentRound);
        }
        return;
      }
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, scheduler: false });
    }
  };

  useEffect(() => {
    if (!session) navigate("/auth/login");
    if (!tournamentId) navigate("/");
    else {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, navigate]);

  const handleChange = (
    index: number,
    field: "startDate" | "endDate",
    date: Date | null
  ) => {
    const updatedTimings = [...roundTimings];
    updatedTimings[index][field] = date;
    setRoundTimings(updatedTimings);
  };

  return (
    <Fragment>
      <Navigation />

      <section className="container md:py-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="border border-tableBorder shadow-table rounded-lg px-4 py-1.5 flex justify-center items-center gap-2 text-sm"
        >
          <IoMdArrowRoundBack />
          {t("back")}
        </button>

        <div className="grid lg:grid-cols-5 gap-4 mt-4">
          {/* Tournament Details */}
          <div className="rounded-lg overflow-hidden shadow-table border border-tableBorder lg:col-span-2 max-h-max">
            {/* Header */}
            <div className="p-4 border-b border-tableBorder">
              <h1 className="text-xl font-primary font-medium text-brand-black">
                {t("tournament details")}
              </h1>
            </div>

            {/* Content */}
            <div className="p-4">
              {loading.get ? (
                <div>
                  <Skeleton className="h-6 w-1/2 mb-4 rounded" />
                  <Skeleton className="h-10 w-full mb-4 rounded" />
                  <Skeleton className="h-6 w-1/2 mb-4 rounded" />
                  <Skeleton className="h-10 w-full mb-4 rounded" />
                  <Skeleton className="h-6 w-1/2 mb-4 rounded" />
                  <Skeleton className="h-10 w-full mb-4 rounded" />
                  <Skeleton className="h-6 w-1/2 mb-4 rounded" />
                  <Skeleton className="h-10 w-full mb-4 rounded" />
                </div>
              ) : loading?.getTournament ? (
                <Loader className="h-auto py-12" />
              ) : (
                <Fragment>
                  {inputs?.tournamentMode === "singleDay" && (
                    <>
                      <Field>
                        <Label className="text-brand-primary font-primary md:text-base text-sm">
                          {t("playing time")}
                        </Label>
                        <select
                          required
                          name="playTime"
                          value={inputs.playTime}
                          onChange={handleInputChange}
                          className="border px-3 font-normal rounded-lg border-[#C6C4D5] w-full mt-1 h-[40px] font-primary md:text-base text-sm text-brand-primary"
                        >
                          <option value="" disabled hidden>
                            {t("select playing time")}
                          </option>
                          {Array.from(
                            { length: 24 },
                            (_, i) => (i + 1) * 5
                          ).map((time) => (
                            <option key={time} value={time}>
                              {time} min
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field className="mt-4">
                        <Label className="text-brand-primary font-primary md:text-base text-sm">
                          {t("pause time")}
                        </Label>
                        <select
                          required
                          name="pauseTime"
                          value={inputs.pauseTime}
                          onChange={handleInputChange}
                          className="border px-3 font-normal rounded-lg border-[#C6C4D5] w-full mt-1 h-[40px] font-primary md:text-base text-sm text-brand-primary"
                        >
                          <option value="" disabled hidden>
                            {t("select pause time")}
                          </option>
                          <option value="5">5 min</option>
                          <option value="10">10 min</option>
                          <option value="15">15 min</option>
                          <option value="20">20 min</option>
                          <option value="25">25 min</option>
                          <option value="30">30 min</option>
                        </select>
                      </Field>
                    </>
                  )}

                  <Field className="mt-4">
                    <Label className="text-brand-primary font-primary md:text-base text-sm">
                      {t("number of rounds")}
                    </Label>
                    <Input
                      required
                      type="number"
                      name="numberOfRounds"
                      className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                      placeholder={t("enter number of rounds")}
                      value={inputs.numberOfRounds}
                      onChange={handleInputChange}
                    />
                  </Field>
                  {inputs?.tournamentMode === "period" && inputs?.numberOfRounds
                    ? roundTimings.map((round, index) => (
                        <div
                          key={index}
                          className="mb-4 p-2 border rounded-lg w-full mt-4"
                        >
                          <p className="font-semibold underline">
                            Round {index + 1}
                          </p>
                          <Field className="mt-1 flex flex-col">
                            <Label className="text-brand-primary font-primary md:text-base text-sm">
                              {t("start time")}{" "}
                              <span className="text-red-600">*</span>
                            </Label>
                            <DatePicker
                              selected={round.startDate}
                              onChange={(date) =>
                                handleChange(index, "startDate", date)
                              }
                              showTimeSelect
                              dateFormat="yyyy-MM-dd HH:mm"
                              timeFormat="HH:mm"
                              className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                            />
                          </Field>
                          <Field className="mt-1 flex flex-col">
                            <Label className="text-brand-primary font-primary md:text-base text-sm">
                              {t("end time")}{" "}
                              <span className="text-red-600">*</span>
                            </Label>
                            <DatePicker
                              selected={round.endDate}
                              onChange={(date) =>
                                handleChange(index, "endDate", date)
                              }
                              showTimeSelect
                              dateFormat="yyyy-MM-dd HH:mm"
                              timeFormat="HH:mm"
                              className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                            />
                          </Field>
                        </div>
                      ))
                    : null}
                </Fragment>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-tableBorder flex justify-end">
              <button
                disabled={loading?.updateTiming || loading?.scheduler}
                onClick={updateTiming}
                className="font-medium bg-brand-primary border rounded-lg border-[#C6C4D5] active:animate-jerk text-white px-4 h-[40px] font-primary md:text-base text-sm flex justify-center items-center gap-2"
              >
                {loading?.updateTiming ? t("saving") : t("save")}
              </button>
            </div>
          </div>

          {/* Scheduler */}
          <div className="lg:col-span-3 space-y-4">
            {/* Player skill management */}
            <div className="rounded-lg overflow-hidden shadow-table border border-tableBorder">
              {/* Header */}
              <div className="p-4 border-b border-tableBorder">
                <h2 className="text-xl font-primary font-medium text-brand-black capitalize">
                  {t("player skill management")}
                </h2>
              </div>
              {/* Table Header */}
              <div className="grid grid-cols-3 border-b border-tableBorderBottom !bg-tableHeader">
                <div className="h-[36px] flex justify-start items-center px-4 font-primary text-brand-divider text-sm font-semibold">
                  <p>Player Name</p>
                </div>
                <div className="h-[36px] flex justify-start items-center px-4 font-primary text-brand-divider text-sm font-semibold">
                  <p>Skill Order</p>
                </div>
                <div className="h-[36px] flex justify-end items-center px-4 font-primary text-brand-divider text-sm font-semibold">
                  <p>Actions</p>
                </div>
              </div>
              {/* List Body */}
              {loading.get || loading?.updateOrder ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="grid w-full grid-cols-3 border-b border-tableBorderBottom"
                    >
                      <div className="py-2 px-4">
                        <Skeleton className="h-4 w-24 rounded" />
                      </div>
                      <div className="py-2 px-4">
                        <Skeleton className="h-4 w-10 rounded" />
                      </div>
                      <div className="py-2 px-4 flex justify-end">
                        <Skeleton className="h-4 w-20 rounded" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="droppable-list">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {participants?.map(
                          ({ _id, alias, name, email }: any, index) => (
                            <Draggable
                              key={_id}
                              draggableId={_id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`grid w-full grid-cols-3 border-b border-tableBorderBottom`}
                                >
                                  <div className="text-brand-divider font-primary md:text-sm text-xs flex break-all items-start h-full text-left justify-start py-2 px-4">
                                    {name}
                                  </div>
                                  <div className="text-brand-divider font-primary md:text-sm text-xs flex break-all items-start h-full text-left justify-start py-2 px-4">
                                    {index + 1}
                                  </div>
                                  <div className="text-brand-divider font-primary md:text-sm text-xs break-all items-start h-full text-left flex justify-end py-2 px-4">
                                    <button
                                      disabled={
                                        loading?.participate === _id ||
                                        loading?.scheduler
                                      }
                                      onClick={() => {
                                        setLoading({
                                          ...loading,
                                          participate: _id,
                                        });
                                        onLeaveTournament(tournamentId, _id);
                                      }}
                                      className="bg-brand-secondary text-xs py-[2px] px-2 rounded-md capitalize"
                                    >
                                      {loading?.participate === _id
                                        ? t("deleting")
                                        : t("delete")}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            {/* Schedule a game */}
            <div className="rounded-lg overflow-hidden shadow-table border border-tableBorder">
              {/* Header */}
              <div className="p-4 border-b border-tableBorder">
                <h2 className="text-xl font-primary font-medium text-brand-black capitalize">
                  {t("scheduler a game (round)")}
                </h2>
              </div>
              {/* Scheduler */}
              <form onSubmit={schedulerSlots} className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    required
                    type="number"
                    name="currentRound"
                    min={1}
                    max={inputs?.numberOfRounds}
                    className="border px-4 md:col-span-4 col-span-3 outline-brand-primary font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full h-[40px] font-primary md:text-base text-sm"
                    placeholder={t("enter round")}
                    value={inputs.currentRound}
                    onChange={handleInputChange}
                  />
                  <Input
                    required
                    type="number"
                    name="numberOfGames"
                    min={1}
                    className="border px-4 md:col-span-4 col-span-3 outline-brand-primary font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full h-[40px] font-primary md:text-base text-sm"
                    placeholder={t("enter number of games in round")}
                    value={inputs.numberOfGames}
                    onChange={handleInputChange}
                  />
                  <Field className={"flex gap-2 items-center justify-start"}>
                    <Switch
                      checked={inputs?.isAvoidListed}
                      onChange={(e) =>
                        setInputs({ ...inputs, isAvoidListed: e })
                      }
                      className={`group inline-flex h-6 w-11 items-center rounded-full transition ${
                        inputs?.isAvoidListed
                          ? "bg-brand-primary"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`size-4 rounded-full bg-white transition ${
                          inputs?.isAvoidListed
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </Switch>
                    <Label className={"md:text-base text-sm text-brand-black"}>
                      {t("Include Avoidlist?")}
                    </Label>
                  </Field>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    disabled={loading?.scheduler}
                    className="font-medium bg-brand-primary border md:col-span-1 col-span-2 rounded-lg text-white border-brand-primary active:animate-jerk px-4 h-[40px] font-primary md:text-base text-sm flex justify-center items-center gap-2"
                  >
                    {loading?.scheduler ? t("scheduling") : t("schedule")}
                  </button>
                </div>
              </form>
            </div>

            {/* Scheduled games */}
            <div className="rounded-lg overflow-hidden shadow-table border border-tableBorder">
              {/* Header */}
              <div className="p-4 border-b border-tableBorder">
                <h2 className="text-xl font-primary font-medium text-brand-black capitalize">
                  {t("scheduled games")}
                </h2>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableHeaderRow className="grid w-full grid-cols-2">
                    <TableHead className="md:text-sm text-xs font-medium">
                      {t("round")}
                    </TableHead>
                    <TableHead className="md:text-sm text-xs font-medium">
                      {t("status")}
                    </TableHead>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {loading.get ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i} className="grid w-full grid-cols-2">
                          <TableCell>
                            <Skeleton className="h-4 w-16 rounded" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20 rounded" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    games?.map((game: any, index) => (
                      <TableRow
                        key={index}
                        className={`grid w-full grid-cols-2 ${
                          index === games?.length - 1 ? "rounded-b-xl" : ""
                        }`}
                      >
                        <TableCell>{game?.currentRound}</TableCell>
                        <TableCell>{game?.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default Scheduler;
