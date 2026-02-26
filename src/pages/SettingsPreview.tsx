/**
 * Dev-only preview of Settings layout for responsive testing.
 * Access at /settings-preview when running in development.
 */
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { AuthUser } from "@/hooks/useCurrentUser";

const mockUser: AuthUser = {
  id: "preview",
  email: "john.doe@example.com",
  alias: "John Doe",
  name: "John Doe",
  dateOfBirth: "2002-02-14",
  gender: "male",
};

function MockSettingsForm() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{t("settings.title")}</h2>
        <button
          type="button"
          className="h-10 px-5 rounded-lg font-medium shrink-0 bg-[#facc15] text-black"
        >
          {t("settings.saveChanges")}
        </button>
      </div>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>Email: {mockUser.email}</p>
        <p>Name: {mockUser.name}</p>
        <p>Alias: {mockUser.alias}</p>
      </div>
    </>
  );
}

export default function SettingsPreview() {
  const { t } = useTranslation();

  return (
    <div className="py-8 px-4 sm:px-6 bg-gray-50 min-h-screen">
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

            <TabsContent value="settings" className="mt-0 p-4 sm:p-6">
              <MockSettingsForm />
            </TabsContent>

            <TabsContent value="favorite-clubs" className="mt-0 p-4 sm:p-6">
              <p className="text-muted-foreground">{t("settings.favoriteClubsPlaceholder")}</p>
            </TabsContent>

            <TabsContent value="admin-clubs" className="mt-0 p-4 sm:p-6">
              <p className="text-muted-foreground">{t("settings.adminClubsPlaceholder")}</p>
            </TabsContent>

            <TabsContent value="delete-account" className="mt-0 p-4 sm:p-6">
              <p className="text-muted-foreground">{t("settings.deleteAccountPlaceholder")}</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
