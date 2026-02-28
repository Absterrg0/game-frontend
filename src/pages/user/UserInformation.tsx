import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, useCompleteSignup } from "@/hooks/auth";
import {
  PENDING_SIGNUP_TOKEN_KEY,
  decodeJwtPayload,
  pendingSignupPayloadSchema,
} from "@/lib/auth";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  UserIcon,
  Calendar03Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

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
    dateOfBirth: Date | undefined;
    gender: "male" | "female" | "other" | "" | undefined;
  }>({
    alias: "",
    name: "",
    dateOfBirth: undefined,
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

    const dateOfBirthStr = inputs.dateOfBirth
      ? format(inputs.dateOfBirth, "yyyy-MM-dd")
      : "";
    const result = await submit({
      ...inputs,
      dateOfBirth: dateOfBirthStr,
    });

    if (result.success) {
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      return;
    }

    if (result.message) {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-6 sm:py-8 px-4 sm:px-6 bg-gray-50">
      <div className="mx-auto w-full max-w-3xl min-w-0">
        <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
          <div className="border-b border-[#e5e7eb] px-4 sm:px-6 pt-4 pb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                {t("signup.title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("signup.subtitle")}
              </p>
            </div>
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-[#fef9c3] text-[#854d0e]">
              <HugeiconsIcon icon={UserIcon} size={20} />
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-0">
            <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
              <Field className="gap-2">
                <FieldLabel
                  htmlFor="signup-email"
                  className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6b7280]"
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

              <div className="grid gap-6 sm:grid-cols-2">
                <Field className="gap-2">
                  <FieldLabel
                    htmlFor="signup-alias"
                    className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6b7280]"
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
                    className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6b7280]"
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
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field className="flex flex-col gap-2">
                  <FieldLabel
                    htmlFor="signup-dob"
                    className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6b7280]"
                  >
                    <HugeiconsIcon icon={Calendar03Icon} size={14} />
                    {t("signup.dateOfBirth")}
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="signup-dob"
                        variant="outline"
                        className={`${inputClassName} justify-start text-left font-normal`}
                      >
                        <HugeiconsIcon icon={Calendar03Icon} size={18} className="mr-2 shrink-0" />
                        {inputs.dateOfBirth ? (
                          format(inputs.dateOfBirth, "dd/MM/yyyy")
                        ) : (
                          <span className="text-muted-foreground">
                            {t("signup.selectDateOfBirth")}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={inputs.dateOfBirth}
                        onSelect={(date) =>
                          setInputs((prev) => ({ ...prev, dateOfBirth: date }))
                        }
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        autoFocus
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field className="gap-2">
                  <FieldLabel
                    htmlFor="gender-select-trigger"
                    className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6b7280]"
                  >
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
                    <SelectTrigger
                      id="gender-select-trigger"
                      className={`${inputClassName} h-11 justify-between`}
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
              </div>
            </div>

            <div className="border-t border-[#e5e7eb] px-4 py-4 sm:px-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full gap-2 bg-[#facc15] text-black text-sm font-medium transition-all hover:bg-[#e6b800] active:scale-[0.99]"
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
      </div>
    </div>
  );
}
