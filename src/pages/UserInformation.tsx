import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputClassName =
  "h-10 md:h-12 w-full rounded-lg border-[#C6C4D5] px-4 font-primary text-sm md:text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary";

export default function UserInformation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const email = Cookies.get("email");
  const appleId = Cookies.get("appleId");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);
  const [clubs, setClubs] = useState<
    {
      _id?: string;
      id?: string;
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

  // Redirect to home if user came here without signup params (already completed)
  useEffect(() => {
    if (!email && !appleId) {
      navigate("/");
    }
  }, [navigate, email, appleId]);

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
      const date = parseISO(inputs.dateOfBirth);
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
        Cookies.remove("email");
        Cookies.remove("appleId");
        window.location.href = "/";
      } else {
        window.alert(response?.data?.message);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      window.alert(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async (query: string) => {
    if (!query) {
      setClubs([]);
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
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      fetchClubs(query);
    }, 300);
    setDebounceTimeout(timeout);
  };

  return (
    <section className="container flex min-h-screen w-full items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[580px] rounded-3xl border border-[#EBEBF3] px-6 py-10 shadow-auth-pop-shadow md:px-6 md:py-6 lg:px-14 lg:py-8"
      >
        <h1 className="text-center font-primary text-[22px] font-bold capitalize text-brand-primary md:text-[26px]">
          {t("signup.title")}
        </h1>
        <Field className="mt-6">
          <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.emailAddress")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            disabled
            required
            type="email"
            name="email"
            className={inputClassName}
            placeholder={t("signup.enterEmailAddress")}
            value={inputs.email}
            onChange={handleInputChange}
          />
        </Field>
        <Field className="mt-4">
          <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.alias")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            required
            type="text"
            name="alias"
            className={inputClassName}
            placeholder={t("signup.enterAlias")}
            value={inputs.alias}
            onChange={handleInputChange}
          />
        </Field>
        <Field className="mt-4">
          <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.name")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            required
            type="text"
            name="name"
            className={inputClassName}
            placeholder={t("signup.enterName")}
            value={inputs.name}
            onChange={handleInputChange}
          />
        </Field>
        <Field className="mt-4 flex flex-col w-full">
          <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.dateOfBirth")}
          </FieldLabel>
          <Input
            type="date"
            name="dateOfBirth"
            className={inputClassName}
            placeholder={t("signup.selectDateOfBirth")}
            value={inputs.dateOfBirth}
            max={format(new Date(), "yyyy-MM-dd")}
            onChange={handleInputChange}
          />
        </Field>
        <Field className="mt-4">
          <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.gender")}
          </FieldLabel>
          <Select
            value={inputs.gender || undefined}
            onValueChange={(value) =>
              setInputs({ ...inputs, gender: value })
            }
          >
            <SelectTrigger
              className={`h-10 w-full md:h-12 rounded-lg border-[#C6C4D5] font-primary text-sm md:text-base`}
            >
              <SelectValue placeholder={t("signup.selectGender")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("signup.male")}</SelectItem>
              <SelectItem value="female">{t("signup.female")}</SelectItem>
              <SelectItem value="other">{t("signup.other")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field className="relative mt-4">
          <Input
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            autoFocus={false}
            type="text"
            placeholder={t("signup.clubs")}
            value={searchTerm}
            onChange={handleClubInputChange}
            className={inputClassName}
          />
          {searchTerm && showSuggestions && clubs.length > 0 && (
            <ul className="absolute left-0 z-50 mt-2 w-full rounded-lg border border-[#C6C4D5] bg-popover">
              {clubs.map((club) => {
                const clubId = club._id ?? club.id ?? "";
                return (
                  <li
                    key={clubId}
                    className="cursor-pointer px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm"
                    onClick={() => {
                      setSearchTerm(club.name);
                      setInputs({
                        ...inputs,
                        club: clubId,
                      });
                      setShowSuggestions(false);
                    }}
                  >
                    {club.name}
                  </li>
                );
              })}
            </ul>
          )}
        </Field>
        <Button
          type="submit"
          disabled={loading}
          className="mt-8 h-11 w-full font-primary bg-brand-secondary text-brand-black hover:bg-brand-secondary/90 active:animate-jerk"
        >
          {loading ? t("signup.signingUp") : t("signup.submit")}
        </Button>
      </form>
    </section>
  );
}
