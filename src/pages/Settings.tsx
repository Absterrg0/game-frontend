import { useState, type ChangeEvent, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isValid } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser, type AuthUser } from "@/hooks/useCurrentUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { queryKeys } from "@/lib/queryKeys";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-[#9ca3af] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9ca3af] disabled:opacity-60";

function getInitialInputs(user: AuthUser) {
  let dob: Date | undefined;
  if (user.dateOfBirth) {
    const parsed = parseISO(String(user.dateOfBirth));
    dob = isValid(parsed) ? parsed : undefined;
  }
  return {
    alias: user.alias ?? "",
    name: user.name ?? "",
    dateOfBirth: dob,
    gender: (user.gender as "male" | "female" | "other" | "") ?? "",
  };
}

function SettingsForm({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { checkAuth } = useAuth();
  const [inputs, setInputs] = useState(() => getInitialInputs(user));
  const { updateProfile, isLoading } = useUpdateProfile({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      checkAuth();
    },
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const dateValue = inputs.dateOfBirth
      ? new Date(
          Date.UTC(
            inputs.dateOfBirth.getFullYear(),
            inputs.dateOfBirth.getMonth(),
            inputs.dateOfBirth.getDate()
          )
        ).toISOString().split("T")[0]
      : null;

    const result = await updateProfile({
      alias: inputs.alias,
      name: inputs.name,
      dateOfBirth: dateValue,
      gender: inputs.gender || null,
    });

    if (result.success) {
      toast.success(t("settings.saveSuccess"));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-foreground">{t("settings.title")}</h2>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="h-10 px-5 rounded-lg font-medium shrink-0 bg-[#facc15] text-black hover:bg-[#e6b800]"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            t("settings.saveChanges")
          )}
        </Button>
      </div>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-6">
            <Field className="gap-2">
              <FieldLabel
                htmlFor="settings-email"
                className="text-xs font-medium uppercase tracking-wider text-[#6b7280]"
              >
                {t("signup.emailAddress")}
              </FieldLabel>
              <Input
                id="settings-email"
                type="email"
                disabled
                className={inputClassName}
                value={user.email ?? ""}
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel
                htmlFor="settings-name"
                className="text-xs font-medium uppercase tracking-wider text-[#6b7280]"
              >
                {t("signup.name")}
              </FieldLabel>
              <Input
                id="settings-name"
                type="text"
                name="name"
                className={inputClassName}
                value={inputs.name}
                onChange={handleInputChange}
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel
                htmlFor="settings-gender"
                className="text-xs font-medium uppercase tracking-wider text-[#6b7280]"
              >
                {t("settings.genderOptional")}
              </FieldLabel>
              <Select
                value={inputs.gender || undefined}
                onValueChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    gender: value === "male" || value === "female" || value === "other" ? value : "",
                  }))
                }
              >
                <SelectTrigger id="settings-gender" className={`${inputClassName} justify-between`}>
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
          <div className="space-y-6">
            <Field className="gap-2">
              <FieldLabel
                htmlFor="settings-alias"
                className="text-xs font-medium uppercase tracking-wider text-[#6b7280]"
              >
                {t("signup.alias")}
              </FieldLabel>
              <Input
                id="settings-alias"
                type="text"
                name="alias"
                className={inputClassName}
                value={inputs.alias}
                onChange={handleInputChange}
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel
                htmlFor="settings-dob"
                className="text-xs font-medium uppercase tracking-wider text-[#6b7280]"
              >
                {t("settings.dateOfBirthOptional")}
              </FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="settings-dob"
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </div>
        </div>
      </form>
    </>
  );
}

function DeleteAccountSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { deleteAccount, isLoading } = useDeleteAccount({
    onSuccess: async () => {
      setConfirmOpen(false);
      await logout();
      navigate("/login", { replace: true });
    },
  });

  const handleDeleteClick = async () => {
    const result = await deleteAccount();
    if (result.success) {
      toast.success(t("settings.deleteAccountSuccess"));
    } else {
      toast.error(result.message ?? t("settings.deleteAccountError"));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">
            {t("settings.deleteAccount")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("settings.deleteAccountPlaceholder")}
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          disabled={isLoading}
          onClick={() => setConfirmOpen(true)}
          className="shrink-0"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            t("settings.deleteAccount")
          )}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.deleteAccountConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.deleteAccountConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.deleteAccountCancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteClick}
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                t("settings.deleteAccountConfirm")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { user, isLoading: userLoading, isAuthenticated, isProfileComplete, dataUpdatedAt } =
    useCurrentUser();

  if (userLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isProfileComplete) return <Navigate to="/information" replace />;

  return (
    <div className="py-8 px-4 sm:px-6 bg-gray-50 h-screen">
      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
          <Tabs defaultValue="settings" className="w-full">
            <div className="border-b border-[#e5e7eb] px-4 sm:px-6 pt-4 pb-4">
              <TabsList className="h-auto w-full flex flex-wrap justify-start gap-2 rounded-md bg-transparent p-0">
                <TabsTrigger
                  value="settings"
                  className="flex-none rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors data-[state=active]:bg-[#f3f4f6] data-[state=active]:text-foreground data-[state=inactive]:bg-transparent"
                >
                  {t("settings.title")}
                </TabsTrigger>
                <TabsTrigger
                  value="favorite-clubs"
                  className="flex-none rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors data-[state=active]:bg-[#f3f4f6] data-[state=active]:text-foreground data-[state=inactive]:bg-transparent"
                >
                  {t("settings.favoriteClubs")}
                </TabsTrigger>
                <TabsTrigger
                  value="admin-clubs"
                  className="flex-none rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors data-[state=active]:bg-[#f3f4f6] data-[state=active]:text-foreground data-[state=inactive]:bg-transparent"
                >
                  {t("settings.clubsIAdministrate")}
                </TabsTrigger>
                <TabsTrigger
                  value="delete-account"
                  className="flex-none rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors data-[state=active]:bg-[#f3f4f6] data-[state=active]:text-foreground data-[state=inactive]:bg-transparent"
                >
                  {t("settings.deleteAccount")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="settings" className="mt-0 p-6">
              <SettingsForm
                key={`${user!.id}-${dataUpdatedAt ?? 0}`}
                user={user!}
              />
            </TabsContent>

            <TabsContent value="favorite-clubs" className="mt-0 p-6">
              <p className="text-muted-foreground">{t("settings.favoriteClubsPlaceholder")}</p>
            </TabsContent>

            <TabsContent value="admin-clubs" className="mt-0 p-6">
              <p className="text-muted-foreground">{t("settings.adminClubsPlaceholder")}</p>
            </TabsContent>

            <TabsContent value="delete-account" className="mt-0 p-6">
              <DeleteAccountSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
