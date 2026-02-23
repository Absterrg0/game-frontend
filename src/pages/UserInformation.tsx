import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupFormSchema } from "@/lib/validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

const inputClassName =
  "h-10 md:h-12 w-full rounded-lg border-[#C6C4D5] px-4 font-primary text-sm md:text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary";

export default function UserInformation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfileComplete, loading: authLoading, checkAuth } = useAuth();
  const emailFromCookie = Cookies.get("email");
  const appleId = Cookies.get("appleId");
  const email = user?.email ?? emailFromCookie ?? "";
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [inputs, setInputs] = useState({
    email: email || "",
    alias: "",
    name: "",
    dateOfBirth: "",
    gender: "",
    appleId: appleId || "",
  });

  useEffect(() => {
    setInputs((prev) => ({ ...prev, email: user?.email ?? emailFromCookie ?? prev.email }));
  }, [user?.email, emailFromCookie]);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && isProfileComplete) {
      navigate("/profile", { replace: true });
      return;
    }
    if (!isAuthenticated && !emailFromCookie && !appleId) {
      navigate("/login", { replace: true });
      return;
    }
  }, [authLoading, isAuthenticated, isProfileComplete, emailFromCookie, appleId, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const result = signupFormSchema.safeParse(inputs);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.flatten().fieldErrors &&
        Object.entries(result.error.flatten().fieldErrors).forEach(
          ([key, msgs]) => {
            if (msgs?.[0]) errors[key] = msgs[0];
          }
        );
      setFieldErrors(errors);
      return;
    }

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
        await checkAuth();
        navigate("/profile", { replace: true });
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center py-8 px-4 sm:px-6">
     
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[580px] rounded-3xl border border-[#EBEBF3] px-6 py-10 shadow-auth-pop-shadow md:px-6 md:py-6 lg:px-14 lg:py-8"
      >
        <h1 className="text-center font-primary text-[22px] font-bold capitalize text-brand-primary md:text-[26px] text-balance">
          {t("signup.title")}
        </h1>
        <Field className="mt-6">
          <FieldLabel htmlFor="signup-email" className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.emailAddress")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="signup-email"
            disabled
            required
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            className={inputClassName}
            placeholder={t("signup.enterEmailAddress")}
            value={inputs.email}
            onChange={handleInputChange}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-destructive" aria-live="polite">{fieldErrors.email}</p>
          )}
        </Field>
        <Field className="mt-4">
          <FieldLabel htmlFor="signup-alias" className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.alias")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="signup-alias"
            required
            type="text"
            name="alias"
            autoComplete="username"
            spellCheck={false}
            className={inputClassName}
            placeholder={t("signup.enterAlias")}
            value={inputs.alias}
            onChange={handleInputChange}
            aria-invalid={!!fieldErrors.alias}
          />
          {fieldErrors.alias && (
            <p className="mt-1 text-sm text-destructive" aria-live="polite">{fieldErrors.alias}</p>
          )}
        </Field>
        <Field className="mt-4">
          <FieldLabel htmlFor="signup-name" className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.name")} <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="signup-name"
            required
            type="text"
            name="name"
            autoComplete="name"
            className={inputClassName}
            placeholder={t("signup.enterName")}
            value={inputs.name}
            onChange={handleInputChange}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-destructive" aria-live="polite">{fieldErrors.name}</p>
          )}
        </Field>
        <Field className="mt-4 flex flex-col w-full">
          <FieldLabel htmlFor="signup-dob" className="font-primary text-sm text-brand-primary md:text-base">
            {t("signup.dateOfBirth")}
          </FieldLabel>
          <Input
            id="signup-dob"
            type="date"
            name="dateOfBirth"
            autoComplete="bday"
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
            onValueChange={(value) => {
              setInputs((prev) => ({ ...prev, gender: value }));
              if (fieldErrors.gender) setFieldErrors((prev) => ({ ...prev, gender: "" }));
            }}
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
        <Button
          type="submit"
          disabled={loading}
          className="mt-8 h-11 w-full font-primary bg-brand-secondary text-brand-black hover:bg-brand-secondary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:animate-jerk"
        >
          {loading ? t("signup.signingUp") : t("signup.submit")}
        </Button>
      </form>
    </section>
  );
}