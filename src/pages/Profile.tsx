import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, parseISO, isValid } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfileComplete, loading: authLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("profile.loading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isProfileComplete) return <Navigate to="/information" replace />;

  const displayDate = (() => {
    if (!user?.dateOfBirth) return "—";
    const parsed = parseISO(String(user.dateOfBirth));
    return isValid(parsed) ? format(parsed, "PPP") : "—";
  })();

  const displayGender = user?.gender
    ? t(`signup.${user.gender}` as "signup.male" | "signup.female" | "signup.other")
    : "—";

  const displayUserType = user?.userType
    ? t(`profile.userType.${user.userType}` as "profile.userType.user" | "profile.userType.admin")
    : "—";

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-[580px] rounded-3xl border border-[#EBEBF3] px-6 py-10 shadow-auth-pop-shadow md:px-6 md:py-6 lg:px-14 lg:py-8">
        <h1 className="text-center font-primary text-[22px] font-bold capitalize text-brand-primary md:text-[26px] text-balance">
          {t("profile.title")}
        </h1>

        <div className="mt-8 space-y-6">
          <Field>
            <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
              {t("profile.id")}
            </FieldLabel>
            <p className="text-sm md:text-base text-foreground font-mono break-all">
              {user?.id ?? "—"}
            </p>
          </Field>

          <Field>
            <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
              {t("signup.emailAddress")}
            </FieldLabel>
            <p className="text-sm md:text-base text-foreground">
              {user?.email ?? "—"}
            </p>
          </Field>

          <Field>
            <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
              {t("signup.name")}
            </FieldLabel>
            <p className="text-sm md:text-base text-foreground">
              {user?.name ?? "—"}
            </p>
          </Field>

          <Field>
            <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
              {t("signup.alias")}
            </FieldLabel>
            <p className="text-sm md:text-base text-foreground">
              {user?.alias ?? "—"}
            </p>
          </Field>

          <Field>
            <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
              {t("signup.dateOfBirth")}
            </FieldLabel>
            <p className="text-sm md:text-base text-foreground">
              {displayDate}
            </p>
          </Field>

          <Field>
            <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
              {t("signup.gender")}
            </FieldLabel>
            <p className="text-sm md:text-base text-foreground">
              {displayGender}
            </p>
          </Field>

          <Field>
            <FieldLabel className="font-primary text-sm text-brand-primary md:text-base">
              {t("profile.userType")}
            </FieldLabel>
            <p className="text-sm md:text-base text-foreground">
              {displayUserType}
            </p>
          </Field>
        </div>

        <Button
          type="button"
          onClick={handleLogout}
          variant="outline"
          className="mt-8 h-11 w-full font-primary border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          {t("common.logout")}
        </Button>
      </div>
    </section>
  );
}
