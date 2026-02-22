import { Fragment, useEffect, useState } from "react";
import Navigation from "../components/shared/Navigation";
import { Field, Label } from "@headlessui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderRow,
  TableRow,
} from "../components/shared/Table";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import CustomSelect from "../components/shared/Select";
import { useUser } from "../context/UserContext";
import { IoFilter } from "react-icons/io5";
import { MdOutlineClear, MdOutlineKeyboardArrowRight } from "react-icons/md";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`} />
);

function Home() {
  const { user } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = Cookies.get("session_key");
  const [hasClub, setHasClub] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFilter, setIsFilter] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [inputs, setInputs] = useState<{
    time: {
      value: string;
      label: string;
    } | null;
    distance: {
      value: string;
      label: string;
    } | null;
    club: {
      value: string;
      label: string;
    } | null;
  }>({
    time: null,
    distance: null,
    club: null,
  });

  const getUserLocation = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(error.message);
        }
      );
    });
  };

  const getTournaments = async () => {
    setLoading(true);

    try {
      // Check if radius is provided
      if (inputs?.distance) {
        // Get user's location only if radius is provided
        const { latitude, longitude } = await getUserLocation();
        const response = await api.post(`/api/v1/public/tournaments`, {
          coordinates: {
            longitude,
            latitude,
          },
          radius: inputs?.distance?.value, // Use the radius provided
          clubId: inputs?.club?.value,
          dateFilter: inputs?.time?.value,
        });

        if (response.status === 200) {
          setTournaments(response?.data?.tournaments);
        }
      } else {
        // If no radius is provided, just call the API with default or no coordinates
        const response = await api.post(`/api/v1/public/tournaments`, {
          coordinates: {
            longitude: "",
            latitude: "",
          },
          radius: inputs?.distance?.value, // Use the radius provided
          clubId: inputs?.club?.value,
          dateFilter: inputs?.time?.value,
        });

        if (response.status === 200) {
          setTournaments(response?.data?.tournaments);
        }
      }
    } catch (error: any) {
      console.log(
        error?.response?.data?.message || error?.response?.data?.messages?.[0]
      );
    } finally {
      setLoading(false);
    }
  };

  // Get clubs
  const getAllClubs = async () => {
    try {
      const response = await api.get(
        `/api/v1/public/filter-clubs?userId=${user?._id}`
      );
      if (response.status === 200) {
        setClubs(response?.data?.clubs);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.messages?.[0]);
    }
  };

  const isHasClub = async () => {
    try {
      const response = await api.get(`/api/v1/user/has-club`);
      if (response.status === 200) {
        setHasClub(response?.data?.hasClub);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.messages?.[0]);
    }
  };

  useEffect(() => {
    getAllClubs();
    getTournaments();
    if (session) isHasClub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    navigate,
    session,
    inputs?.time,
    inputs?.distance,
    inputs?.club,
    user?._id,
  ]);

  return (
    <Fragment>
      <Navigation />
      <section className="container md:py-8 py-6 max-w-[1000px]">
        {hasClub === 1 && !loading && session && (
          <div className="flex md:flex-row flex-col md:justify-end justify-center items-center md:gap-4 gap-2 mb-4">
            <Link
              to="/tournaments?tab=create-tournament"
              className="px-4 py-2 md:w-max w-full rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
            >
              {t("create tournament")}
            </Link>
            <Link
              to="/tournaments"
              className="px-4 py-2 md:w-max w-full rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
            >
              {t("view tournaments i organise")}
            </Link>
          </div>
        )}
        <div className="rounded-lg shadow-table border border-tableBorder">
          {/* Header */}
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-primary font-medium text-brand-black">
                {t("All Tournaments")}
              </h1>
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
            {isFilter && (
              <Fragment>
                <div className="w-full grid md:grid-cols-3 md:gap-6 gap-2">
                  <Field>
                    <Label className="text-brand-primary font-primary text-sm">
                      {t("time")}
                    </Label>
                    <CustomSelect
                      dropdownItems={[
                        {
                          label: t("past"),
                          value: "past",
                        },
                        {
                          label: t("future"),
                          value: "future",
                        },
                      ]}
                      selectedOption={inputs?.time}
                      setSelectedOption={(e: any) =>
                        setInputs({ ...inputs, time: e })
                      }
                      placeholder={t("time")}
                      height="36px"
                      required
                      id="time"
                      className="md:col-span-2"
                    />
                  </Field>
                  <Field>
                    <Label className="text-brand-primary font-primary text-sm">
                      {t("distance")}
                    </Label>
                    <CustomSelect
                      dropdownItems={[
                        {
                          label: "<50KM",
                          value: "<50",
                        },
                        {
                          label: "50KM-80KM",
                          value: "50-80",
                        },
                        {
                          label: ">80KM",
                          value: ">80",
                        },
                      ]}
                      selectedOption={inputs?.distance}
                      setSelectedOption={(e: any) =>
                        setInputs({ ...inputs, distance: e })
                      }
                      placeholder={t("distance from home club")}
                      height="36px"
                      required
                      id="distance"
                      className="md:col-span-2"
                    />
                  </Field>
                  <Field>
                    <Label className="text-brand-primary font-primary text-sm">
                      {t("clubs")}
                    </Label>
                    <CustomSelect
                      dropdownItems={clubs}
                      selectedOption={inputs?.club}
                      setSelectedOption={(e: any) =>
                        setInputs({ ...inputs, club: e })
                      }
                      placeholder={t("clubs")}
                      height="36px"
                      required
                      id="clubs"
                      className="md:col-span-2"
                    />
                  </Field>
                </div>
                {(inputs?.club || inputs?.distance || inputs?.time) && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() =>
                        setInputs({ time: null, distance: null, club: null })
                      }
                      className="px-2 py-1 bg-red-600 text-sm text-white font-primary rounded-lg"
                    >
                      {t("clear filter")}
                    </button>
                  </div>
                )}
              </Fragment>
            )}
          </div>

          <Table className="md:table hidden">
            <TableHeader>
              <TableHeaderRow className="grid w-full grid-cols-2">
                <TableHead className="md:text-sm text-xs">
                  <span className="mr-4">#</span>
                  {t("tournaments")}
                </TableHead>
                <TableHead className="md:text-sm text-xs justify-end">
                  {t("date")}
                </TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="grid w-full grid-cols-2">
                      <TableCell className="flex gap-2 items-center">
                        <Skeleton className="w-[25px] h-4 rounded" />
                        <Skeleton className="w-[22px] h-[22px] rounded-full" />
                        <Skeleton className="w-32 h-4 rounded" />
                      </TableCell>
                      <TableCell className="flex justify-end items-center">
                        <Skeleton className="w-20 h-4 rounded" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading &&
                tournaments.length > 0 &&
                tournaments.map((tournament: any, index) => (
                  <TableRow
                    key={index}
                    className={`grid w-full grid-cols-2 cursor-pointer`}
                    onClick={() => {
                      // if (!session) {
                      //   const confirmed = window.confirm(
                      //     "You need to login to participate. Do you want to go to the login page?"
                      //   );
                      //   if (confirmed) {
                      //     navigate("/auth/login");
                      //   }
                      //   return;
                      // }
                      if (tournament?.idFull)
                        return window.alert("Tournament is full");
                      navigate(`/tournaments/${tournament?._id}`);
                    }}
                  >
                    {/* Tournament Name */}
                    <TableCell className="flex justify-start items-center gap-1">
                      <span className="w-[25px]">{index + 1}</span>
                      {tournament?.logo !== "" ? (
                        <img
                          src={tournament?.logo}
                          alt={tournament?.name}
                          className="overflow-hidden w-[22px] h-[22px] rounded-full bg-[#D9D9D9] object-contain"
                        />
                      ) : (
                        <div className="w-[22px] h-[22px] rounded-full bg-[#D9D9D9] p-1">
                          <img
                            src={"/logo.png"}
                            alt={tournament?.name}
                            className="overflow-hidden w-full h-full object-contain"
                          />
                        </div>
                      )}

                      {tournament?.name}
                      <span
                        className={`min-w-[7px] h-[7px] rounded-full ${
                          tournament?.idFull ? "bg-red-600" : "bg-[#89B89D]"
                        }`}
                      ></span>
                    </TableCell>
                    {/* Date */}
                    <TableCell className="flex justify-end items-center">
                      {tournament?.date ? (
                        new Date(tournament?.date).toISOString().split("T")[0]
                      ) : (
                        <span className="text-brand-black/50">Unscheduled</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && tournaments.length === 0 && (
                <TableRow className="grid w-full grid-cols-1">
                  <TableCell className="flex justify-center">
                    {t("no tournament found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Mobile */}
          <div className="space-y-4 md:hidden p-4 pt-0">
            {loading &&
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 bg-[#010A040A] rounded-lg overflow-hidden grid grid-cols-3 gap-2"
                >
                  <div className="col-span-2 flex flex-col gap-2">
                    <Skeleton className="w-[22px] h-[22px] rounded-full" />
                    <Skeleton className="w-32 h-4 rounded" />
                  </div>
                  <aside className="flex justify-end items-center h-full w-full">
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </aside>
                </div>
              ))}
            {!loading &&
              tournaments.length > 0 &&
              tournaments.map((tournament: any, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#010A040A] rounded-lg overflow-hidden grid grid-cols-3 gap-2"
                  onClick={() => {
                    // if (!session) {
                    //   const confirmed = window.confirm(
                    //     "You need to login to participate. Do you want to go to the login page?"
                    //   );
                    //   if (confirmed) {
                    //     navigate("/auth/login");
                    //   }
                    //   return;
                    // }
                    if (tournament?.idFull)
                      return window.alert("Tournament is full");
                    navigate(`/tournaments/${tournament?._id}`);
                  }}
                >
                  <div className="col-span-2 flex flex-col gap-2">
                    {tournament?.logo !== "" ? (
                      <img
                        src={tournament?.logo}
                        alt={tournament?.name}
                        className="overflow-hidden w-[22px] h-[22px] rounded-full bg-[#D9D9D9] object-contain"
                      />
                    ) : (
                      <div className="w-[22px] h-[22px] rounded-full bg-[#D9D9D9] p-1">
                        <img
                          src={"/logo.png"}
                          alt={tournament?.name}
                          className="overflow-hidden w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <h3 className="flex justify-start items-center gap-2 text-sm">
                      {tournament?.name}
                      <span
                        className={`min-w-[7px] h-[7px] rounded-full ${
                          tournament?.idFull ? "bg-red-600" : "bg-[#89B89D]"
                        }`}
                      />
                    </h3>
                  </div>
                  <aside className="flex justify-end items-center h-full w-full">
                    <MdOutlineKeyboardArrowRight />
                  </aside>
                </div>
              ))}
          </div>
        </div>
      </section>
    </Fragment>
  );
}

export default Home;
