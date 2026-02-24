import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
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
import { useAuth } from "@/contexts/AuthContext";
import { useCompleteSignup } from "@/hooks/useCompleteSignup";
import { PENDING_SIGNUP_TOKEN_KEY } from "@/lib/auth";
import { decodeJwtPayload, pendingSignupPayloadSchema } from "@/lib/jwt";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  UserIcon,
  Calendar03Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-60 md:text-base";

export default function UserInformation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfileComplete, loading: authLoading, checkAuth } = useAuth();
  const pendingToken = sessionStorage.getItem(PENDING_SIGNUP_TOKEN_KEY);

  const { submit, isLoading } = useCompleteSignup({
    getPendingToken: () => sessionStorage.getItem(PENDING_SIGNUP_TOKEN_KEY),
    onSuccess: async () => {
      await checkAuth();
      navigate("/profile", { replace: true });
    },
  });

  let displayEmail = user?.email ?? "";
  if (!displayEmail && pendingToken) {
    try {
      displayEmail = decodeJwtPayload(pendingToken, pendingSignupPayloadSchema).pendingEmail ?? "";
    } catch {
      // displayEmail stays ""
    }
  }

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [inputs, setInputs] = useState<{
    alias: string;
    name: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other" | "" | undefined;
  }>({
    alias: "",
    name: "",
    dateOfBirth: "",
    gender: "",
  });

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center animate-in fade-in duration-300"
        style={{
          background: "linear-gradient(165deg, oklch(0.99 0.005 260) 0%, oklch(0.97 0.01 260) 50%, oklch(0.98 0.008 260) 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isProfileComplete) return <Navigate to="/profile" replace />;
  if (!isAuthenticated && !pendingToken) return <Navigate to="/login" replace />;

  const handleInputChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    const result = await submit(inputs);

    if (result.success) {
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      return;
    }

    if (result.message) {
      window.alert(result.message);
    }
  };

  return (
    <section
      className="relative min-h-screen w-full py-12 px-4 sm:px-6 md:py-16"
      style={{
        background: "linear-gradient(165deg, oklch(0.99 0.005 260) 0%, oklch(0.97 0.01 260) 50%, oklch(0.98 0.008 260) 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-[520px] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={UserIcon} size={24} />
          </div>
          <h1 className="font-semibold text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("signup.title")}
          </h1>
          <p className="mt-2  text-sm text-muted-foreground">
            {t("signup.subtitle")}
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={onSubmit}
          className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-auth-pop-shadow backdrop-blur-sm"
        >
          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
            <Field className="gap-2">
              <FieldLabel
                htmlFor="signup-email"
                className="flex items-center gap-2  text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                <HugeiconsIcon icon={Mail01Icon} size={14} />
                {t("signup.emailAddress")} <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="signup-email"
                disabled
                type="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                className={inputClassName}
                placeholder={t("signup.enterEmailAddress")}
                value={displayEmail}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email ? (
                <p className="text-sm text-destructive" aria-live="polite">
                  {fieldErrors.email}
                </p>
              ) : null}
            </Field>

            <Field className="gap-2">
              <FieldLabel
                htmlFor="signup-alias"
                className="flex items-center gap-2  text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                <HugeiconsIcon icon={UserIcon} size={14} />
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
              {fieldErrors.alias ? (
                <p className="text-sm text-destructive" aria-live="polite">
                  {fieldErrors.alias}
                </p>
              ) : null}
            </Field>

            <Field className="gap-2">
              <FieldLabel
                htmlFor="signup-name"
                className="flex items-center gap-2  text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                <HugeiconsIcon icon={UserIcon} size={14} />
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
              {fieldErrors.name ? (
                <p className="text-sm text-destructive" aria-live="polite">
                  {fieldErrors.name}
                </p>
              ) : null}
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field className="flex flex-col gap-2">
                <FieldLabel
                  htmlFor="signup-dob"
                  className="flex items-center gap-2  text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  <HugeiconsIcon icon={Calendar03Icon} size={14} />
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

              <Field className="gap-2">
                <FieldLabel className="flex items-center gap-2  text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <HugeiconsIcon icon={UserIcon} size={14} />
                  {t("signup.gender")}
                </FieldLabel>
                <Select
                  value={inputs.gender || undefined}
                  onValueChange={(value) => {
                    setInputs((prev) => ({
                      ...prev,
                      gender: value === "male" || value === "female" || value === "other" ? value : "",
                    }));
                    if (fieldErrors.gender) setFieldErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                >
                  <SelectTrigger className={`${inputClassName} h-11 justify-between`}>
                    <SelectValue placeholder={t("signup.selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("signup.male")}</SelectItem>
                    <SelectItem value="female">{t("signup.female")}</SelectItem>
                    <SelectItem value="other">{t("signup.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div className="border-t border-border/60 px-6 py-5 sm:px-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full gap-2 bg-primary text-primary-foreground  text-base font-medium transition-all hover:opacity-95 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("signup.signingUp")}
                </>
              ) : (
                <>
                  {t("signup.submit")}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
