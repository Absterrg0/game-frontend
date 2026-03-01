import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Crown, Info, ChevronLeft } from "lucide-react";
import { useAdminClubs, useClubStaff } from "@/hooks/club";
import { useAuth, useHasRoleOrAbove } from "@/hooks/auth";
import { ROLES } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StaffRow } from "@/components/clubs/StaffRow";
import { AddAdminOrganiserModal } from "@/components/clubs/AddAdminOrganiserModal";

export default function ManageClubPage() {
  const { t } = useTranslation();
  const hasAccess = useHasRoleOrAbove(ROLES.CLUB_ADMIN);
  const { isAuthenticated, isProfileComplete, loading } = useAuth();
  const { data: adminClubsData, isLoading: clubsLoading } = useAdminClubs(hasAccess);

  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  /** On mobile: 'clubs' = show club list, 'staff' = show staff list. Desktop always shows both. */
  const [mobileView, setMobileView] = useState<"clubs" | "staff">("clubs");

  const clubs = adminClubsData?.clubs ?? [];
  const selectedClub = clubs.find((c) => c.id === selectedClubId) ?? clubs[0] ?? null;
  const effectiveClubId = selectedClub?.id ?? selectedClubId;

  useEffect(() => {
    if (clubs.length > 0 && !selectedClubId) {
      setSelectedClubId(clubs[0].id);
    }
  }, [clubs, selectedClubId]);

  const { data: staffData, isLoading: staffLoading } = useClubStaff(effectiveClubId);
  const staff = staffData?.staff ?? [];
  const existingStaffIds = staff.map((s) => s.id);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isProfileComplete) return <Navigate to="/information" replace />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center bg-gray-50">
      <div className="flex w-full max-w-6xl flex-col lg:flex-row">
        {/* Sidebar - on mobile: hidden when showing staff view */}
        <aside
          className={cn(
            "w-full border-b border-border bg-muted/30 p-4 lg:w-80 lg:border-b-0 lg:border-r",
            mobileView === "staff" && "hidden lg:block"
          )}
        >
        <h2 className="text-lg font-semibold text-foreground">{t("manageClub.allClubs")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("manageClub.selectClub")}</p>

        {clubsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          </div>
        ) : clubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("manageClub.noClubs")}</p>
        ) : (
          <div className="space-y-2">
            {clubs.map((club) => {
              const isSelected = club.id === effectiveClubId;
              return (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => {
                    setSelectedClubId(club.id);
                    setMobileView("staff");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                    isSelected
                      ? "border-[#067429] bg-[#067429]/5 ring-1 ring-[#067429]"
                      : "border-border bg-card hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "h-3 w-3 shrink-0 rounded-full",
                      isSelected ? "bg-[#067429]" : "bg-muted-foreground/40"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{club.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("manageClub.membersCount", { count: 0 })} ·{" "}
                      {t("manageClub.eventsCount", { count: 0 })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/30">
          <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm">
            <p className="font-medium text-foreground">{t("manageClub.adminManagement")}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
              <li>{t("manageClub.ruleDrag")}</li>
              <li>{t("manageClub.ruleDefault")}</li>
              <li>{t("manageClub.ruleExpiry")}</li>
              <li>{t("manageClub.ruleReactivate")}</li>
            </ul>
          </div>
        </div>
        </aside>

        {/* Main content - on mobile: hidden when showing clubs view */}
        <main
          className={cn(
            "flex-1 p-4 lg:p-6",
            mobileView === "clubs" && "hidden lg:block"
          )}
        >
        {!effectiveClubId ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">{t("manageClub.selectClubToManage")}</p>
          </div>
        ) : (
          <>
            {/* Back button - mobile only, returns to club list */}
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2 lg:hidden"
              onClick={() => setMobileView("clubs")}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("manageClub.backToClubs")}
            </Button>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  {selectedClub?.name}
                  <Crown className="h-5 w-5 text-[#067429]" aria-hidden />
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("manageClub.manageAdminsSubtitle")}
                </p>
              </div>
              <Button
                className="shrink-0 bg-[#067429] hover:bg-[#056023]"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("manageClub.addMember")}
              </Button>
            </div>

            {staffLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
              </div>
            ) : staff.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center">
                <p className="text-muted-foreground">{t("manageClub.noStaff")}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setAddModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("manageClub.addMember")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {staff.map((member) => (
                  <StaffRow
                    key={member.id}
                    member={member}
                    onMenuAction={(action, id) => {
                      // Placeholder - logic to be implemented later
                      console.log(action, id);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
        </main>
      </div>

      <AddAdminOrganiserModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        clubId={effectiveClubId ?? ""}
        existingStaffIds={existingStaffIds}
      />
    </div>
  );
}
