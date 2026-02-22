import { Fragment } from "react/jsx-runtime";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Field, Input, Label } from "@headlessui/react";
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "../components/shared/Table";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import api from "../lib/axios";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface TableRowData {
  name: string;
  courtType: string;
  placement: string;
}

type AddressSuggestion = {
  label: string; // Address label (e.g., "123 Main St, City, Country")
  coordinates: [number, number]; // [longitude, latitude]
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`} />
);

function Club() {
  const queryParams = new URLSearchParams(window.location.search);
  const page = queryParams.get("page") || "1";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = Cookies.get("session_key");
  const [addClub, setAddClub] = useState(false);
  const [clubId, setClubId] = useState<string | null>(null);
  const [limit, setLimit] = useState("10");
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [clubs, setClubs] = useState([]);
  const [inputs, setInputs] = useState({
    name: "",
    website: "",
    address: "",
    coordinates: { latitude: 0, longitude: 0 },
  });
  const [loading, setLoading] = useState<{
    get: boolean;
    set: boolean;
    achieve: boolean;
  }>({
    get: true,
    set: false,
    achieve: false,
  });
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tableRows, setTableRows] = useState<TableRowData[]>([
    { name: "1", courtType: "", placement: "" },
  ]);

  const getUserClubs = async () => {
    setLoading({ ...loading, get: true });
    try {
      const response = await api.get(
        `/api/v1/user/clubs?page=${page}&limit=${limit}`
      );
      if (response.status === 200) {
        setClubs(response?.data?.clubs);
        setPagination(response?.data?.pagination);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.message);
    } finally {
      setLoading({ ...loading, get: false });
    }
  };

  useEffect(() => {
    if (!session) navigate("/auth/login");
    else getUserClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session, limit, page]);

  const handleAddRow = () => {
    // Find the last numeric row name
    const findLastNumericName = () => {
      for (let i = tableRows.length - 1; i >= 0; i--) {
        const rowName = tableRows[i]?.name;
        if (!isNaN(Number(rowName))) {
          return Number(rowName);
        }
      }
      return 0; // Default to 0 if no numeric name is found
    };

    // Determine the new row name
    const lastNumericName = findLastNumericName();
    const newRowName = (lastNumericName + 1).toString();

    const lastRow = tableRows[tableRows?.length - 1];

    // Add the new row
    setTableRows([
      ...tableRows,
      {
        name: newRowName,
        courtType: lastRow?.courtType,
        placement: lastRow?.placement,
      },
    ]);
  };

  const handleRowChange = (
    index: number,
    field: keyof TableRowData,
    value: string
  ) => {
    const updatedRows = tableRows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setTableRows(updatedRows);
  };

  const handleDeleteRow = (index: number) => {
    const updatedRows = tableRows.filter((_, i) => i !== index);
    setTableRows(updatedRows);
  };

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchAddressSuggestions = debounce(async (value: string) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json`,
        {
          params: {
            access_token: process.env.REACT_APP_MAPBOX_API_KEY,
            limit: 5,
          },
        }
      );

      const suggestions = response.data.features.map((feature: any) => ({
        label: feature.place_name,
        coordinates: feature.center,
      }));

      setAddressSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error: any) {
      window.alert(error?.message || "Unable to fetch address");
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "address") fetchAddressSuggestions(value);

    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleSelectAddress = (suggestion: any) => {
    setInputs({
      ...inputs,
      address: suggestion.label,
      coordinates: {
        latitude: suggestion.coordinates[1],
        longitude: suggestion.coordinates[0],
      },
    });
    setShowSuggestions(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading({ ...loading, set: true });
    try {
      const response = clubId
        ? await api.put(`/api/v1/user/club/${clubId}`, {
            ...inputs,
            courts: tableRows,
          })
        : await api.post("/api/v1/user/club", {
            ...inputs,
            courts: tableRows,
          });
      if (response.status === 200 && !response?.data?.error) {
        clubId && setClubId(null);
        setAddClub(false);
        setInputs({
          name: "",
          website: "",
          address: "",
          coordinates: { latitude: 0, longitude: 0 },
        });
        setTableRows([{ name: "", courtType: "", placement: "" }]);
        getUserClubs();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, set: false });
    }
  };

  const archiveClub = async (id: string) => {
    setLoading({ ...loading, achieve: true });
    try {
      const response = await api.patch(`/api/v1/user/archive-club/${id}`);
      if (
        response.status === 200 &&
        !response?.data?.error &&
        response?.data?.code === "CLUB_ARCHIVED"
      ) {
        getUserClubs();
      } else {
        window.alert(response?.data?.messages?.[0]);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.messages?.[0]);
    } finally {
      setLoading({ ...loading, achieve: false });
    }
  };

  return (
    <Fragment>
      {!addClub && (
        <section className="rounded-lg overflow-hidden shadow-table border border-tableBorder">
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <h1 className="text-brand-primary md:text-2xl text-xl font-primary font-semibold capitalize">
              {t("Clubs that I administrate")}
            </h1>
            <button
              onClick={() => {
                setAddClub(true);
                setClubId(null);
              }}
              type="button"
              className="px-4 py-2 md:w-max w-full rounded-lg font-semibold bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
            >
              {t("add club")}
            </button>
          </div>

          <Table className="w-full overflow-auto border-none">
            <TableHeader>
              <TableHeaderRow className="grid w-full grid-cols-2 rounded-t-xl">
                <TableHead className="md:h-[40px] md:text-sm text-xs font-medium">
                  {t("club")}
                </TableHead>
                <TableHead className="md:h-[40px] md:text-sm text-xs font-medium">
                  {t("actions")}
                </TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {loading.get && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="grid w-full grid-cols-2">
                      <TableCell>
                        <Skeleton className="h-4 w-32 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16 rounded" />
                          <Skeleton className="h-6 w-16 rounded" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading.get &&
                clubs?.length > 0 &&
                clubs?.map((club: any, index: number) => {
                  return (
                    <TableRow
                      key={club?._id}
                      className={`grid w-full grid-cols-2`}
                    >
                      <TableCell>{club?.name}</TableCell>
                      <TableCell className="flex justify-start items-center gap-2">
                        <button
                          disabled={loading.achieve}
                          onClick={() => {
                            const isConfirmed = window.confirm(
                              t(
                                "Are you sure you want to archive this club? It removes all published tournaments for this club."
                              )
                            );
                            if (isConfirmed) {
                              archiveClub(club?._id); // Only call archiveClub if the user confirms
                            }
                          }}
                          type="button"
                          className="bg-red-800 text-white text-xs py-[2px] px-2 rounded-md"
                        >
                          {t("archive")}
                        </button>

                        <button
                          onClick={() => {
                            setInputs({
                              name: club?.name,
                              website: club?.website,
                              address: club?.address,
                              coordinates: {
                                latitude: club?.coordinates?.coordinates?.[1],
                                longitude: club?.coordinates?.coordinates?.[0],
                              },
                            });
                            const courts = club?.courts?.map((court: any) => ({
                              name: court?.name,
                              courtType: court?.courtType,
                              placement: court?.placement,
                            }));
                            setTableRows(courts);
                            setAddClub(true);
                            setClubId(club?._id);
                          }}
                          type="button"
                          className="bg-brand-secondary text-xs py-[2px] px-2 rounded-md"
                        >
                          {t("edit")}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {!loading.get && clubs?.length === 0 && (
                <TableRow
                  className={`grid w-full p-2 rounded-b-xl text-center`}
                >
                  {t("no club found")}
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center p-4 border-t border-tableBorder">
            <select
              name="limit"
              defaultValue="10"
              className={
                "border px-2 font-light rounded-lg border-[#C6C4D5] h-[30px] font-primary text-sm text-brand-primary"
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
                  navigate(`/clubs?page=${pageNumber <= 0 ? 1 : pageNumber}`);
                }}
                type="button"
                className="bg-brand-secondary capitalize rounded-lg mx-auto active:animate-jerk h-[30px] font-primary text-sm px-2"
              >
                <FaArrowLeft />
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
                  navigate(`/clubs?page=${pageNumber}`);
                }}
                type="button"
                className="bg-brand-secondary capitalize rounded-lg mx-auto active:animate-jerk h-[30px] font-primary text-sm px-2"
              >
                <FaArrowRight />
              </button>
            </aside>
          </div>
        </section>
      )}
      {addClub && (
        <form
          onSubmit={onSubmit}
          className="rounded-lg overflow-hidden shadow-table border border-tableBorder"
        >
          <div className="p-4 border-b border-tableBorder">
            <h1 className="text-brand-primary md:text-2xl text-xl font-primary font-semibold capitalize">
              {t("club that i administrate")}
            </h1>
          </div>
          <div className="p-4">
            <Field>
              <Label className="text-brand-primary font-primary md:text-base text-sm font-medium">
                {t("club name")} <span className="text-red-600">*</span>
              </Label>
              <Input
                required
                type="text"
                name="name"
                className="border px-4 font-normal outline-brand-primary rounded-lg border-[#C6C4D5] text-brand-primary placeholder:text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                placeholder={t("enter club name")}
                value={inputs.name}
                onChange={handleInputChange}
              />
            </Field>
            <Field className="mt-6">
              <Label className="text-brand-primary font-primary md:text-base text-sm font-medium">
                {t("website")}
              </Label>
              <Input
                type="text"
                name="website"
                className="border px-4 font-normal outline-brand-primary rounded-lg border-[#C6C4D5] text-brand-primary placeholder:text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                placeholder={t("enter website")}
                value={inputs.website}
                onChange={handleInputChange}
              />
            </Field>
            <Field className="mt-6">
              <Label className="text-brand-primary font-primary md:text-base text-sm font-medium">
                {t("address")} <span className="text-red-600">*</span>
              </Label>
              <Input
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                autoFocus={false}
                required
                type="text"
                name="address"
                className="border px-4 font-normal outline-brand-primary rounded-lg border-[#C6C4D5] text-brand-primary placeholder:text-brand-primary w-full mt-1 h-[40px] font-primary md:text-base text-sm"
                placeholder={t("enter address")}
                value={inputs.address}
                onChange={handleInputChange}
              />
              {inputs?.address &&
                showSuggestions &&
                addressSuggestions.length > 0 && (
                  <ul className="border border-[#C6C4D5] mt-2 bg-white rounded-lg">
                    {addressSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-200 outline-brand-primary rounded-lg"
                        onClick={() => handleSelectAddress(suggestion)}
                      >
                        {suggestion.label}
                      </li>
                    ))}
                  </ul>
                )}
            </Field>

            <Table className="mt-8 w-full overflow-auto border-none">
              <TableHeader>
                <TableHeaderRow className="grid w-full grid-cols-7 rounded-t-xl">
                  <TableHead className="md:h-[40px] md:text-sm text-xs font-medium px-2 col-span-2">
                    {t("court name")}
                  </TableHead>
                  <TableHead className="md:h-[40px] md:text-sm text-xs font-medium col-span-2">
                    {t("type")}
                  </TableHead>
                  <TableHead className="md:h-[40px] md:text-sm text-xs font-medium col-span-2">
                    {t("placement")}
                  </TableHead>
                  <TableHead className="md:h-[40px] md:text-sm text-xs font-medium"></TableHead>
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, index) => (
                  <TableRow
                    key={index}
                    className={`grid w-full grid-cols-7 ${
                      index === tableRows.length - 1 ? "rounded-b-xl" : ""
                    }`}
                  >
                    <TableCell className="p-1 col-span-2">
                      <Input
                        required
                        type="text"
                        name="name"
                        placeholder={t("type court name")}
                        value={row.name}
                        onChange={(e) =>
                          handleRowChange(index, "name", e.target.value)
                        }
                        className="border px-2 h-[40px] outline-brand-primary font-normal rounded-lg placeholder:text-brand-primary border-[#C6C4D5] text-brand-primary w-full font-primary"
                      />
                    </TableCell>
                    <TableCell className="p-1 col-span-2">
                      <select
                        name="type"
                        value={row.courtType}
                        onChange={(e) =>
                          handleRowChange(index, "courtType", e.target.value)
                        }
                        className="border px-1 font-normal rounded-lg border-[#C6C4D5] w-full h-[40px] font-primary md:text-base text-sm text-brand-primary"
                      >
                        <option value="" disabled hidden>
                          {t("select type")}
                        </option>
                        <option value="grass">{t("grass")}</option>
                        <option value="clay">{t("clay")}</option>
                        <option value="concrete">{t("concrete")}</option>
                        <option value="carpet">{t("carpet")}</option>
                        <option value="asphalt">{t("asphalt")}</option>
                      </select>
                    </TableCell>
                    <TableCell className="p-1 col-span-2">
                      <select
                        name="placement"
                        value={row.placement}
                        onChange={(e) =>
                          handleRowChange(index, "placement", e.target.value)
                        }
                        className="border px-1 font-normal rounded-lg border-[#C6C4D5] w-full h-[40px] font-primary md:text-base text-sm text-brand-primary"
                      >
                        <option value="" disabled hidden>
                          {t("placement")}
                        </option>
                        <option value="indoor">{t("indoor")}</option>
                        <option value="outdoor">{t("outdoor")}</option>
                      </select>
                    </TableCell>
                    <TableCell className="p-1 flex justify-center items-center">
                      <button
                        type="button"
                        className="text-red-800 md:text-2xl text-xl"
                        onClick={() => handleDeleteRow(index)}
                      >
                        <MdDelete />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <button
              type="button"
              onClick={handleAddRow}
              className="font-medium bg-brand-secondary border rounded-lg mx-auto mt-4 active:animate-jerk py-1 font-primary md:text-base text-sm px-4 flex justify-center items-center gap-2"
            >
              <IoMdAdd />
              {t("add court")}
            </button>
          </div>
          <div className="flex justify-end items-center p-4 border-t border-tableBorder gap-3">
            <button
              disabled={loading.set}
              type="button"
              onClick={() => {
                setAddClub(false);
                setInputs({
                  name: "",
                  website: "",
                  address: "",
                  coordinates: { latitude: 0, longitude: 0 },
                });
                setTableRows([{ name: "1", courtType: "", placement: "" }]);
              }}
              className="font-medium capitalize border-2 rounded-lg border-red-800 active:animate-jerk text-red-800 h-[40px] font-primary md:text-base text-sm px-4 flex justify-center items-center gap-2"
            >
              {t("cancel")}
            </button>
            <button
              disabled={loading.set}
              type="submit"
              className="font-medium bg-brand-secondary border border-brand-secondary rounded-lg active:animate-jerk h-[40px] font-primary md:text-base text-sm px-4 flex justify-center items-center gap-2"
            >
              {loading.set ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      )}
    </Fragment>
  );
}

export default Club;
