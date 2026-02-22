import { Fragment } from "react/jsx-runtime";
import Navigation from "../components/shared/Navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@headlessui/react";
import { Field, Input, Label, Textarea } from "@headlessui/react";
import { format, isValid, parseISO } from "date-fns";
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
import { useDropzone } from "react-dropzone";
import { IoMdCheckmark } from "react-icons/io";
import Tooltip from "../components/shared/Tooltip";
import { NavLink } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import { IoFilter } from "react-icons/io5";
import { MdOutlineClear } from "react-icons/md";

const convertTimeToDate = (time: string): Date | null => {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0); // Set hours, minutes, and reset seconds & milliseconds

  return date;
};

interface RoundTiming {
  startDate: Date | null;
  endDate: Date | null;
}

const Tournament = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const page = queryParams.get("page") || "1";
  const tab = queryParams.get("tab");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = Cookies.get("session_key");
  const [addTournament, setAddTournament] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [clubs, setClubs] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState<{
    get: boolean;
    set: boolean;
    setDraft: boolean;
    achieve: boolean;
  }>({
    get: false,
    set: false,
    setDraft: false,
    achieve: false,
  });
  const [status, setStatus] = useState("");
  const [club, setClub] = useState("");
  const [limit, setLimit] = useState("10");
  const [isFilter, setIsFilter] = useState(false);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    total: 0,
    page: 0,
    limit: 0,
    totalPages: 0,
  });
  const [inputs, setInputs] = useState<{
    name: string;
    logo: string;
    club: string;
    date: string;
    startTime: Date | null;
    endTime: Date | null;
    playMode: string;
    memberFee: string;
    externalFee: string;
    minMember: string;
    maxMember: string;
    courts: string[];
    foodInfo: string;
    descriptionInfo: string;
    numberOfRounds: string;
    playTime: string;
    pauseTime: string;
    tournamentMode: string;
  }>({
    name: "",
    logo: "",
    club: "",
    date: "",
    startTime: null,
    endTime: null,
    playMode: "",
    memberFee: "",
    externalFee: "",
    minMember: "",
    maxMember: "",
    courts: [],
    numberOfRounds: "",
    foodInfo: "",
    descriptionInfo: "",
    pauseTime: "",
    playTime: "",
    tournamentMode: "",
  });
  const [roundTimings, setRoundTimings] = useState<RoundTiming[]>([]);

  const getUserTournaments = async () => {
    setLoading({ ...loading, get: true });
    try {
      const response = await api.get(
        `/api/v1/user/tournaments?page=${page}&limit=${limit}&status=${status}&club=${club}`
      );
      if (response.status === 200) {
        setTournaments(response?.data?.tournaments);
        setPagination(response?.data?.pagination);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, get: false });
    }
  };

  const getDropdownClubs = async () => {
    try {
      const response = await api.get(`/api/v1/user/club-dropdown`);
      if (response.status === 200) {
        setClubs(response?.data?.clubs);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.message);
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

  const handleFileDrop = (acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      alert("The uploaded file exceeds the maximum allowed size of 2MB.");
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setInputs((prev) => ({ ...prev, logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Safely format startTime/endTime
    const formattedStartTime =
      inputs.startTime && isValid(new Date(inputs.startTime))
        ? format(new Date(inputs.startTime), "HH:mm")
        : null;

    const formattedEndTime =
      inputs.endTime && isValid(new Date(inputs.endTime))
        ? format(new Date(inputs.endTime), "HH:mm")
        : null;

    // Safely handle date -> UTC midnight ISO
    let utcISOString: string | undefined | null = null;
    if (inputs?.date) {
      const parsed = parseISO(inputs.date); // works for YYYY-MM-DD
      if (isValid(parsed)) {
        utcISOString = new Date(
          Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
        ).toISOString();
      }
    }

    // Updated object (undefined instead of empty string if missing)
    const updatedInputs = {
      ...inputs,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      roundTimings,
      date: utcISOString,
    };
    // Access the native submit event
    const nativeEvent = e.nativeEvent as SubmitEvent;
    const clickedButton = nativeEvent.submitter as HTMLButtonElement;
    const action = clickedButton.value;
    setLoading(
      action === "publish"
        ? { ...loading, set: true }
        : { ...loading, setDraft: true }
    );
    try {
      const response = tournamentId
        ? await api.put(`/api/v1/user/tournament/${tournamentId}`, {
            ...updatedInputs,
            status: action === "publish" ? "active" : "draft",
          })
        : await api.post("/api/v1/user/tournament", {
            ...updatedInputs,
            status: action === "publish" ? "active" : "draft",
          });
      if (response.status === 200 && !response?.data?.error) {
        setInputs({
          name: "",
          logo: "",
          club: "",
          date: "",
          startTime: null,
          endTime: null,
          playMode: "",
          memberFee: "",
          externalFee: "",
          minMember: "",
          numberOfRounds: "",
          maxMember: "",
          courts: [],
          foodInfo: "",
          descriptionInfo: "",
          pauseTime: "",
          playTime: "",
          tournamentMode: "",
        });
        tournamentId && setTournamentId(null);
        getUserTournaments();
        setAddTournament(false);
        navigate("/tournaments");
      } else {
        window.alert(response?.data?.messages[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages[0]);
    } finally {
      setLoading(
        action === "publish"
          ? { ...loading, set: false }
          : { ...loading, setDraft: false }
      );
    }
  };

  useEffect(() => {
    if (!session) navigate("/auth/login");
    else {
      getUserTournaments();
      getDropdownClubs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session, page, limit, status, club, tab]);

  useEffect(() => {
    if (tab === "create-tournament") setAddTournament(true);
  }, [tab]);

  const fetchClubCourts = async (clubId: string) => {
    try {
      const response = await api.post(`/api/v1/user/courts-by-club-id`, {
        clubId,
      });
      console.log(response.data.courts);
      setCourts(response.data.courts || []);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const handleChange = (
    index: number,
    field: "startDate" | "endDate",
    date: Date | null
  ) => {
    const updatedTimings = [...roundTimings];
    updatedTimings[index][field] = date;
    setRoundTimings(updatedTimings);
  };

  // Add this Skeleton component at the top (or import from your components if you have one)
  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 ${className}`} />
  );

  return (
    <Fragment>
      <Navigation />
      {!addTournament && (
        <section className="container md:py-8 py-6">
          <div className="rounded-lg overflow-hidden shadow-table border border-tableBorder">
            {/* Header */}
            <div className="p-4 md:border-b-none border-b border-tableBorder">
              <div className="flex justify-between items-start">
                <Link
                  to={"/"}
                  className="md:text-xl text-lg font-primary font-medium text-brand-black"
                >
                  {t("tournaments")}
                </Link>
                <div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setAddTournament(true);
                        setTournamentId(null);
                        navigate("/tournaments?tab=create-tournament");
                      }}
                      type="button"
                      className="px-4 h-[30px] capitalize md:w-max rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
                    >
                      {t("create")}
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
                  </div>
                  {/* Filters */}
                  {isFilter && (
                    <div className="flex justify-end items-center gap-2 mt-4">
                      <select
                        name="tournaments"
                        defaultValue=""
                        className={
                          "border px-2 outline-brand-primary font-light rounded-lg border-[#C6C4D5] h-[30px] font-primary text-sm"
                        }
                        value={club}
                        onChange={(e) => setClub(e.target?.value)}
                      >
                        <option value="" disabled hidden>
                          {t("by club")}
                        </option>
                        <option value="">{t("all")}</option>
                        {clubs?.map((club) => (
                          <option value={club.id}>{club.name}</option>
                        ))}
                      </select>
                      <select
                        name="tournaments"
                        defaultValue=""
                        className={
                          "border px-2 outline-brand-primary font-light rounded-lg border-[#C6C4D5] h-[30px] font-primary text-sm"
                        }
                        value={status}
                        onChange={(e) => setStatus(e.target?.value)}
                      >
                        <option value="" disabled hidden>
                          {t("by status")}
                        </option>
                        <option value="">{t("all")}</option>
                        <option className="text-white" value="active">
                          Published
                        </option>
                        <option className="text-white" value="draft">
                          Draft
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <Table className="md:table hidden">
              <TableHeader>
                <TableHeaderRow className="grid w-full md:grid-cols-5 grid-cols-3">
                  <TableHead className="md:text-sm text-xs">
                    {t("name")}
                  </TableHead>
                  <TableHead className="md:text-sm text-xs">
                    {t("club")}
                  </TableHead>
                  <TableHead className="md:text-sm text-xs">
                    {t("date")}
                  </TableHead>
                  <TableHead className="md:text-sm text-xs">
                    {t("status")}
                  </TableHead>
                  <TableHead className="md:text-sm text-xs">
                    {t("actions")}
                  </TableHead>
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {!loading.get && tournaments?.length === 0 && (
                  <TableRow
                    className={`grid w-full p-2 rounded-b-xl text-center`}
                  >
                    {t("no tournament found")}
                  </TableRow>
                )}
                {loading.get && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <TableRow
                        key={i}
                        className="grid w-full md:grid-cols-5 grid-cols-3"
                      >
                        <TableCell>
                          <Skeleton className="h-4 w-24 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-14 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
                {!loading.get &&
                  tournaments?.length > 0 &&
                  tournaments?.map((tournament: any, index) => (
                    <TableRow
                      className={`grid w-full md:grid-cols-5 grid-cols-3`}
                    >
                      <TableCell>{tournament?.name}</TableCell>
                      <TableCell>{tournament?.club?.name}</TableCell>
                      <TableCell>
                        {tournament?.date &&
                        !isNaN(new Date(tournament.date).getTime())
                          ? new Date(tournament.date)
                              .toISOString()
                              .split("T")[0]
                          : "Unscheduled"}
                      </TableCell>
                      <TableCell>
                        {tournament?.status === "active"
                          ? "Published"
                          : tournament?.status}
                      </TableCell>
                      <TableCell className="flex justify-start flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            setInputs({
                              name: tournament?.name,
                              logo: tournament?.logo,
                              club: tournament?.club,
                              date: tournament?.date
                                ? new Date(tournament?.date)
                                    .toISOString()
                                    .split("T")?.[0]
                                : "",
                              startTime: convertTimeToDate(
                                tournament?.startTime
                              ),
                              endTime: convertTimeToDate(tournament?.endTime),
                              playMode: tournament?.playMode,
                              memberFee: tournament?.memberFee,
                              externalFee: tournament?.externalFee,
                              minMember: tournament?.minMember,
                              numberOfRounds: tournament?.numberOfRounds,
                              maxMember: tournament?.maxMember,
                              courts: tournament?.courts,
                              foodInfo: tournament?.foodInfo,
                              descriptionInfo: tournament?.descriptionInfo,
                              pauseTime: tournament?.pauseTime,
                              playTime: tournament?.playTime,
                              tournamentMode: tournament?.tournamentMode,
                            });
                            const times = tournament?.roundTimings?.map(
                              (item: RoundTiming) => ({
                                startDate: item?.startDate
                                  ? new Date(item.startDate)
                                  : null, // Use undefined instead of null
                                endDate: item?.endDate
                                  ? new Date(item.endDate)
                                  : null,
                              })
                            );
                            fetchClubCourts(tournament?.club);
                            setRoundTimings(times);
                            setTournamentId(tournament?._id);
                            setAddTournament(true);
                          }}
                          className="bg-brand-secondary text-xs py-[2px] px-2 rounded-md whitespace-nowrap"
                        >
                          {t("edit")}
                        </button>
                        {/* {tournament?.date &&
                          tournament?.status === "active" &&
                          !isNaN(new Date(tournament.date).getTime()) &&
                          new Date(tournament.date).getTime() > Date.now() && (
                            <NavLink
                              to={`/scheduler?tournament=${tournament?._id}`}
                              className="bg-brand-primary text-white text-xs py-[2px] px-2 rounded-md whitespace-nowrap"
                            >
                              {t("schedule")}
                            </NavLink>
                          )}
                        {!tournament?.date &&
                          tournament?.status === "active" && (
                            <NavLink
                              to={`/scheduler?tournament=${tournament?._id}`}
                              className="bg-brand-primary text-white text-xs py-[2px] px-2 rounded-md whitespace-nowrap"
                            >
                              {t("schedule")}
                            </NavLink>
                          )} */}
                        <NavLink
                          to={`/scheduler?tournament=${tournament?._id}`}
                          className="bg-brand-primary text-white text-xs py-[2px] px-2 rounded-md whitespace-nowrap"
                        >
                          {t("schedule")}
                        </NavLink>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* For Mobile */}
            <div className="space-y-4 md:hidden p-4">
              {!loading.get &&
                tournaments.length > 0 &&
                tournaments.map((tournament: any, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[#010A040A] rounded-lg overflow-hidden"
                  >
                    <h3 className="flex justify-start items-center gap-2 text-sm capitalize">
                      {`${tournament?.name} (${tournament?.club?.name})`}
                    </h3>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setInputs({
                            name: tournament?.name,
                            logo: tournament?.logo,
                            club: tournament?.club,
                            date: tournament?.date
                              ? new Date(tournament?.date)
                                  .toISOString()
                                  .split("T")?.[0]
                              : "",
                            startTime: convertTimeToDate(tournament?.startTime),
                            endTime: convertTimeToDate(tournament?.endTime),
                            playMode: tournament?.playMode,
                            memberFee: tournament?.memberFee,
                            externalFee: tournament?.externalFee,
                            minMember: tournament?.minMember,
                            numberOfRounds: tournament?.numberOfRounds,
                            maxMember: tournament?.maxMember,
                            courts: tournament?.courts,
                            foodInfo: tournament?.foodInfo,
                            descriptionInfo: tournament?.descriptionInfo,
                            pauseTime: tournament?.pauseTime,
                            playTime: tournament?.playTime,
                            tournamentMode: tournament?.tournamentMode,
                          });
                          const times = tournament?.roundTimings?.map(
                            (item: RoundTiming) => ({
                              startDate: item?.startDate
                                ? new Date(item.startDate)
                                : null, // Use undefined instead of null
                              endDate: item?.endDate
                                ? new Date(item.endDate)
                                : null,
                            })
                          );
                          fetchClubCourts(tournament?.club);
                          setRoundTimings(times);
                          setTournamentId(tournament?._id);
                          setAddTournament(true);
                        }}
                        className="bg-brand-secondary text-xs py-[2px] px-2 rounded-md whitespace-nowrap"
                      >
                        {t("edit")}
                      </button>
                      {/* {tournament?.date &&
                        tournament?.status === "active" &&
                        !isNaN(new Date(tournament.date).getTime()) &&
                        new Date(tournament.date).getTime() > Date.now() && (
                          <NavLink
                            to={`/scheduler?tournament=${tournament?._id}`}
                            className="bg-brand-primary text-white text-xs py-[2px] px-2 rounded-md whitespace-nowrap"
                          >
                            {t("schedule")}
                          </NavLink>
                        )}
                      {!tournament?.date && tournament?.status === "active" && (
                        <NavLink
                          to={`/scheduler?tournament=${tournament?._id}`}
                          className="bg-brand-primary text-white text-xs py-[2px] px-2 rounded-md whitespace-nowrap"
                        >
                          {t("schedule")}
                        </NavLink>
                      )} */}
                      <NavLink
                        to={`/scheduler?tournament=${tournament?._id}`}
                        className="bg-brand-primary text-white text-xs py-[2px] px-2 rounded-md whitespace-nowrap"
                      >
                        {t("schedule")}
                      </NavLink>
                    </div>
                  </div>
                ))}
              {loading.get && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="p-4 bg-[#010A040A] rounded-lg overflow-hidden space-y-2"
                    >
                      <Skeleton className="h-4 w-40 rounded mb-2" />
                      <div className="flex gap-2 mt-4">
                        <Skeleton className="h-6 w-16 rounded" />
                        <Skeleton className="h-6 w-16 rounded" />
                      </div>
                    </div>
                  ))}
                </>
              )}
              {!loading.get && tournaments?.length === 0 && (
                <div className="p-4 bg-[#010A040A] rounded-lg overflow-hidden">
                  {t("no tournament found")}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-tableBorder">
              <select
                name="limit"
                defaultValue="10"
                className={
                  "border px-2 font-light outline-brand-primary rounded-lg border-[#C6C4D5] h-[30px] font-primary text-sm text-brand-primary"
                }
                value={limit}
                onChange={(e) => setLimit(e.target?.value)}
              >
                <option className="text-brand-primary" value="10">
                  10
                </option>
                <option className="text-brand-primary" value="25">
                  25
                </option>
              </select>
              <aside className="flex justify-center items-center gap-2">
                <button
                  disabled={Number(page) === 1}
                  onClick={() => {
                    const pageNumber = parseInt(page, 10) - 1;
                    navigate(
                      `/tournaments?page=${pageNumber <= 0 ? 1 : pageNumber}`
                    );
                  }}
                  type="button"
                  className="bg-brand-secondary capitalize rounded-lg mx-auto active:animate-jerk h-[30px] font-primary text-sm px-2"
                >
                  {t("prev")}
                </button>
                <p className="text-sm font-medium text-brand-primary">
                  {pagination.page + "/" + pagination.totalPages}
                </p>
                <button
                  disabled={
                    Number(pagination.totalPages) === Number(page) ||
                    Number(pagination.totalPages) === 0
                  }
                  onClick={() => {
                    const pageNumber = parseInt(page, 10) + 1;
                    navigate(`/tournaments?page=${pageNumber}`);
                  }}
                  type="button"
                  className="bg-brand-secondary capitalize rounded-lg mx-auto active:animate-jerk h-[30px] font-primary text-sm px-2"
                >
                  {t("next")}
                </button>
              </aside>
            </div>
          </div>
        </section>
      )}

      {addTournament && (
        <section className="container md:py-8 py-6 max-w-[1000px]">
          <form
            onSubmit={onSubmit}
            className="rounded-lg overflow-hidden shadow-table border border-tableBorder"
          >
            <div className="p-4 border-b border-tableBorder">
              <h1 className="text-brand-primary md:text-2xl text-xl font-primary font-semibold capitalize">
                {t("create tournament")}
              </h1>
            </div>
            <div className="p-4">
              <div
                {...getRootProps()}
                className={`border-dashed border-2 border-[#C6C4D5] rounded-lg p-4 text-center cursor-pointer ${
                  isDragActive ? "bg-gray-100" : ""
                }`}
              >
                <input {...getInputProps()} />
                {inputs.logo ? (
                  <img
                    src={inputs.logo}
                    alt="logo preview"
                    className="mx-auto max-h-[250px] object-cover rounded-lg"
                  />
                ) : (
                  <p>
                    {isDragActive
                      ? t("Drop image here")
                      : t("drag or click to upload logo")}
                  </p>
                )}
              </div>
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm capitalize">
                  {t("club")} <span className="text-red-600">*</span>
                </Label>
                <select
                  required
                  name="club"
                  value={inputs.club}
                  onChange={(e) => {
                    fetchClubCourts(e?.target?.value);
                    handleInputChange(e);
                  }}
                  className="border px-3 font-normal rounded-lg border-[#C6C4D5] w-full mt-1 h-[40px] font-primary md:text-base text-sm text-brand-primary"
                >
                  <option value="" disabled hidden>
                    {t("select club")}
                  </option>
                  {clubs?.map((club) => (
                    <option value={club.id}>{club.name}</option>
                  ))}
                </select>
              </Field>
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("tournament name")} <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  type="text"
                  name="name"
                  className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                  value={inputs.name}
                  onChange={handleInputChange}
                  placeholder={t("enter name")}
                />
              </Field>
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("tournament type")} <span className="text-red-600">*</span>
                </Label>
                <select
                  required
                  name="tournamentMode"
                  value={inputs.tournamentMode}
                  onChange={handleInputChange}
                  className="border px-3 font-normal rounded-lg border-[#C6C4D5] w-full mt-1 h-[40px] font-primary md:text-base text-sm text-brand-primary"
                >
                  <option value="" disabled hidden>
                    {t("select tournament type")}
                  </option>
                  <option value="singleDay">Scheduled</option>
                  <option value="period">unscheduled</option>
                </select>
              </Field>
              {inputs?.tournamentMode === "singleDay" ? (
                <Fragment>
                  <Field className="mt-6">
                    <Label className="text-brand-primary font-primary md:text-base text-sm">
                      {t("date")} <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      required
                      type="date"
                      name="date"
                      className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                      value={inputs.date}
                      onChange={handleInputChange}
                    />
                  </Field>
                  <Field className="mt-6 flex flex-col">
                    <Label className="text-brand-primary font-primary md:text-base text-sm">
                      {t("start time")} <span className="text-red-600">*</span>
                    </Label>
                    <DatePicker
                      selected={inputs.startTime}
                      onChange={(time: Date | null) =>
                        setInputs({
                          ...inputs,
                          startTime: time,
                        })
                      }
                      placeholderText="Select start time"
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15} // Interval between times (e.g., every 15 minutes)
                      timeCaption="Time"
                      dateFormat="HH:mm" // Ensures 24-hour format
                      timeFormat="HH:mm" // Explicitly set time format
                      className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                    />
                  </Field>
                  <Field className="mt-6 flex flex-col">
                    <Label className="text-brand-primary font-primary md:text-base text-sm">
                      {t("end time")} <span className="text-red-600">*</span>
                    </Label>
                    <DatePicker
                      selected={inputs.endTime}
                      onChange={(time: Date | null) =>
                        setInputs({
                          ...inputs,
                          endTime: time,
                        })
                      }
                      placeholderText="Select end time"
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15} // Interval between times (e.g., every 15 minutes)
                      timeCaption="Time"
                      dateFormat="HH:mm" // Ensures 24-hour format
                      timeFormat="HH:mm" // Explicitly set time format
                      className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                    />
                  </Field>
                </Fragment>
              ) : null}
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("play mode")} <span className="text-red-600">*</span>
                </Label>
                <select
                  required
                  name="playMode"
                  value={inputs.playMode}
                  onChange={handleInputChange}
                  className="border px-3 font-normal rounded-lg border-[#C6C4D5] w-full mt-1 h-[40px] font-primary md:text-base text-sm text-brand-primary"
                >
                  <option value="" disabled hidden>
                    {t("select play mode")}
                  </option>
                  <option value="TieBreak10">TieBreak10</option>
                  <option value="1set">1 set</option>
                  <option value="3setTieBreak10">3 set-TB10</option>
                  <option value="3set">3 set</option>
                  <option value="5set">5 set</option>
                </select>
              </Field>
              {inputs?.tournamentMode === "singleDay" ? (
                <>
                  <Field className="mt-6">
                    <Label className="text-brand-primary font-primary md:text-base text-sm">
                      {t("playing time")}{" "}
                      <span className="text-red-600">*</span>
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
                      {Array.from({ length: 24 }, (_, i) => (i + 1) * 5).map(
                        (time) => (
                          <option key={time} value={time}>
                            {time} min
                          </option>
                        )
                      )}
                    </select>
                  </Field>
                  <Field className="mt-6">
                    <Label className="text-brand-primary font-primary md:text-base text-sm">
                      {t("pause time")} <span className="text-red-600">*</span>
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
              ) : null}

              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("member participation fee")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  name="memberFee"
                  min={0}
                  className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                  placeholder={t("enter member participation fee")}
                  value={inputs.memberFee}
                  onChange={handleInputChange}
                />
              </Field>
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("external participation fee")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  min={0}
                  type="number"
                  name="externalFee"
                  className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                  placeholder={t("enter external participation fee")}
                  value={inputs.externalFee}
                  onChange={handleInputChange}
                />
              </Field>
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("minimum members")} <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  name="minMember"
                  min={1}
                  className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                  placeholder={t("enter minimum members")}
                  value={inputs.minMember}
                  onChange={handleInputChange}
                />
              </Field>
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("maximum members")} <span className="text-red-600">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  name="maxMember"
                  min={1}
                  className="border px-4 font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                  placeholder={t("enter maximum members")}
                  value={inputs.maxMember}
                  onChange={handleInputChange}
                />
              </Field>
              {inputs.tournamentMode === "singleDay" && (
                <Field className="mt-6">
                  <Label className="text-brand-primary font-primary md:text-base text-sm">
                    {t("number of courts")}{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  {courts?.length > 0 &&
                    courts?.map(
                      (
                        item: {
                          _id: string;
                          name: string;
                          courtType: string;
                          placement: string;
                        },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="flex justify-between items-center gap-2 p-2 rounded-lg border-[#C6C4D5] border mt-2"
                        >
                          <Checkbox
                            onClick={() => {
                              const courts = [...inputs?.courts];
                              if (courts?.includes(item?._id)) {
                                const newArray = courts?.filter(
                                  (el: string) => el !== item?._id
                                );
                                setInputs({
                                  ...inputs,
                                  courts: newArray,
                                });
                              } else {
                                setInputs({
                                  ...inputs,
                                  courts: [...courts, item?._id],
                                });
                              }
                            }}
                            checked={inputs?.courts?.includes(item?._id)}
                            className="cursor-pointer group size-6 rounded-md bg-[#C6C4D5] p-1 ring-1 ring-white/15 ring-inset data-[checked]:bg-[#C6C4D5]"
                          >
                            <IoMdCheckmark className="hidden size-4 fill-black group-data-[checked]:block" />
                          </Checkbox>
                          <p className="text-base font-primary text-brand-primary">
                            <Tooltip text={item?.name}>
                              {item?.name?.length > 10
                                ? `${item?.name?.slice(0, 7)}...`
                                : item?.name}
                            </Tooltip>
                          </p>
                          <p className="text-base font-primary text-brand-primary">
                            {item?.courtType}
                          </p>
                          <p className="text-base font-primary text-brand-primary">
                            {item?.placement}
                          </p>
                        </div>
                      )
                    )}
                </Field>
              )}
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("number of rounds")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  min={1}
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
                          {t("start time")}
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
                          {t("end time")}
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
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("food and drinks")} <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  name="foodInfo"
                  placeholder={t("enter food and drinks details")}
                  className={
                    "border px-4 py-2 min-h-[150px] font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 font-primary md:text-base text-sm"
                  }
                  value={inputs.foodInfo}
                  onChange={handleInputChange}
                />
              </Field>
              <Field className="mt-6">
                <Label className="text-brand-primary font-primary md:text-base text-sm">
                  {t("info")} <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  name="descriptionInfo"
                  placeholder={t("enter info")}
                  className={
                    "border px-4 py-2 min-h-[150px] font-normal rounded-lg border-[#C6C4D5] text-brand-primary w-full mt-1 font-primary md:text-base text-sm"
                  }
                  value={inputs.descriptionInfo}
                  onChange={handleInputChange}
                />
              </Field>
            </div>
            <div className="flex justify-end items-center p-4 border-t border-tableBorder gap-3">
              <button
                disabled={loading.set}
                type="button"
                onClick={() => {
                  setAddTournament(false);
                  setInputs({
                    name: "",
                    logo: "",
                    club: "",
                    date: "",
                    startTime: null,
                    endTime: null,
                    playMode: "",
                    memberFee: "",
                    externalFee: "",
                    minMember: "",
                    maxMember: "",
                    courts: [],
                    foodInfo: "",
                    descriptionInfo: "",
                    numberOfRounds: "",
                    pauseTime: "",
                    playTime: "",
                    tournamentMode: "",
                  });
                  setTournamentId(null);
                  navigate("/tournaments");
                }}
                className="font-medium border-2 rounded-lg border-red-800 active:animate-jerk text-red-800 h-[36px] capitalize font-primary md:text-base text-sm px-4 flex justify-center items-center gap-2"
              >
                {t("cancel")}
              </button>
              <button
                disabled={loading.setDraft}
                type="submit"
                name="action"
                value="draft"
                className="font-medium px-4 bg-brand-secondary border whitespace-nowrap rounded-lg border-brand-secondary active:animate-jerk h-[36px] font-primary md:text-base text-sm flex justify-center items-center"
              >
                {loading.setDraft ? t("saving") : t("save as draft")}
              </button>
              <button
                disabled={loading.set}
                type="submit"
                name="action"
                value="publish"
                className="font-medium px-4 bg-brand-primary border rounded-lg border-brand-primary active:animate-jerk text-white h-[36px] font-primary md:text-base text-sm flex justify-center items-center"
              >
                {loading.set ? t("saving") : t("publish")}
              </button>
            </div>
          </form>
        </section>
      )}
    </Fragment>
  );
};

export default Tournament;
