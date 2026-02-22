import { Field, Input, Label } from "@headlessui/react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

export default function UserInformation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = Cookies.get("session_key");
  const email = Cookies.get("email");
  const appleId = Cookies.get("appleId");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [clubs, setClubs] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [inputs, setInputs] = useState({
    email: email || "",
    alias: "",
    name: "",
    dateOfBirth: "",
    gender: "",
    club: "",
    appleId: appleId || "",
  });

  useEffect(() => {
    if (session) navigate("/");
  }, [navigate, session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    let utcISOString: string | null = null;

    if (inputs?.dateOfBirth) {
      const date = parseISO(inputs.dateOfBirth); // Parses as local time
      utcISOString = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      ).toISOString();
    }

    try {
      const response = await api.post("/api/auth/complete-signup", {
        ...inputs,
        dateOfBirth: utcISOString,
      });
      if (
        response.status === 200 &&
        !response?.data?.error &&
        response?.data?.code === "SIGNUP_SUCCESSFUL"
      ) {
        Cookies.set("session_key", response?.data?.token, {
          expires: 7,
          path: "/",
          secure: process.env.NODE_ENV === "production", // Only secure in production
          sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        });
        Cookies.remove("email");
        window.location.href = "/"; // Redirect to home page
      } else {
        window.alert(response?.data?.message);
      }
    } catch (error: any) {
      window.alert(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async (query: string) => {
    if (!query) {
      setClubs([]); // Clear results if the input is empty
      return;
    }
    try {
      const response = await api.get(`/api/v1/public/clubs`, {
        params: { search: query },
      });
      setClubs(response.data.clubs || []);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const handleClubInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setShowSuggestions(true);
    // Debounce the fetch call
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      fetchClubs(query);
    }, 300); // Adjust delay as needed (300ms works well)
    setDebounceTimeout(timeout);
  };

  return (
    <section className="w-full flex justify-center items-center min-h-screen container">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[580px] rounded-3xl border border-[#EBEBF3] px-6 py-10 shadow-auth-pop-shadow md:px-6 md:py-6 lg:px-14 lg:py-8"
      >
        <h1 className="text-center font-primary text-[22px] font-bold capitalize text-brand-primary md:text-[26px]">
          {t("sign up")}
        </h1>
        <Field className="mt-6">
          <Label className="text-brand-primary font-primary md:text-base text-sm">
            {t("email address")} <span className="text-red-600">*</span>
          </Label>
          <Input
            disabled
            required
            type="email"
            name="email"
            className="border px-4 font-normal rounded-lg pointer-events-none outline-brand-primary border-[#C6C4D5] text-brand-primary placeholder:text-brand-primary w-full mt-1 md:h-[48px] h-[40px] font-primary md:text-base text-sm"
            placeholder={t("enter email address")}
            value={inputs.email}
            onChange={handleInputChange}
          />
        </Field>
        <Field className="mt-4">
          <Label className="text-brand-primary font-primary md:text-base text-sm">
            {t("alias")} <span className="text-red-600">*</span>
          </Label>
          <Input
            required
            type="text"
            name="alias"
            className="border px-4 font-normal rounded-lg border-[#C6C4D5] outline-brand-primary text-brand-primary placeholder:text-brand-primary w-full mt-1 md:h-[48px] h-[40px] font-primary md:text-base text-sm"
            placeholder={t("enter alias")}
            value={inputs.alias}
            onChange={handleInputChange}
          />
        </Field>
        <Field className="mt-4">
          <Label className="text-brand-primary font-primary md:text-base text-sm">
            {t("name")} <span className="text-red-600">*</span>
          </Label>
          <Input
            required
            type="text"
            name="name"
            className="border px-4 font-normal rounded-lg border-[#C6C4D5] outline-brand-primary text-brand-primary placeholder:text-brand-primary w-full mt-1 md:h-[48px] h-[40px] font-primary md:text-base text-sm"
            placeholder={t("enter name")}
            value={inputs.name}
            onChange={handleInputChange}
          />
        </Field>
        <Field className="mt-4 flex flex-col w-full">
          <Label className="text-brand-primary font-primary md:text-base text-sm">
            {t("date of birth")}
          </Label>
          <Input
            type="date"
            name="dateOfBirth"
            className="border px-4 font-normal rounded-lg border-[#C6C4D5] outline-brand-primary text-brand-primary w-full mt-1 md:h-[48px] h-[40px] font-primary md:text-base text-sm"
            placeholder={t("select date of birth")}
            value={inputs.dateOfBirth}
            max={format(new Date(), "yyyy-MM-dd")} // 👈 disallow future dates
            onChange={handleInputChange}
          />
        </Field>
        <Field className="mt-4">
          <Label className="text-brand-primary font-primary md:text-base text-sm">
            {t("gender")}
          </Label>
          <select
            name="gender"
            value={inputs.gender}
            onChange={handleInputChange}
            className="border px-3 font-normal rounded-lg border-[#C6C4D5] w-full mt-1 outline-brand-primary md:h-[48px] h-[40px] font-primary md:text-base text-sm text-brand-primary"
          >
            <option value="" disabled hidden>
              {t("select gender")}
            </option>
            <option value="male">{t("male")}</option>
            <option value="female">{t("female")}</option>
            <option value="other">{t("other")}</option>
          </select>
        </Field>
        <Field className="mt-4 relative">
          <Input
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            autoFocus={false}
            type="text"
            placeholder={t("clubs")}
            value={searchTerm}
            onChange={handleClubInputChange}
            className={`border px-4 font-normal rounded-lg w-full border-[#C6C4D5] outline-brand-primary text-brand-primary placeholder:text-brand-primary md:h-[48px] h-[40px] font-primary md:text-base text-sm`}
          />
          {searchTerm && showSuggestions && clubs.length > 0 && (
            <ul className="border border-[#C6C4D5] mt-2 bg-white rounded-lg absolute w-full left-0 z-50">
              {clubs.map((club: any) => (
                <li
                  key={club._id}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-200 rounded-lg"
                  onClick={() => {
                    setSearchTerm(club.name);
                    setInputs({
                      ...inputs,
                      club: club._id,
                    });
                    setShowSuggestions(false);
                  }}
                >
                  {club.name}
                </li>
              ))}
            </ul>
          )}
        </Field>
        {/* <Field className="mt-4">
          <Label className="text-brand-primary font-primary md:text-base text-sm capitalize">
            {t("club")} <span className="text-red-600">*</span>
          </Label>
          <select
            required
            name="club"
            value={inputs.club}
            onChange={handleInputChange}
            className="border px-3 font-normal rounded-lg border-[#C6C4D5] w-full mt-1 md:h-[48px] h-[40px] font-primary md:text-base text-sm text-brand-primary"
          >
            <option value="" disabled hidden>
              {t("select club")}
            </option>
            {clubs?.map((club) => (
              <option value={club.id}>{club.name}</option>
            ))}
          </select>
        </Field> */}
        <button
          type="submit"
          className="px-2 py-3 mt-8 w-full  rounded-lg bg-brand-secondary font-primary text-sm text-brand-black active:animate-jerk flex justify-center items-center gap-2"
        >
          {loading ? t("signing up") : t("sign up")}
        </button>
      </form>
    </section>
  );
}
