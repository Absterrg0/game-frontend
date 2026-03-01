import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminClubs } from "@/hooks/club";
import { useHasRoleOrAbove } from "@/hooks/auth/useRBAC";
import { ROLES } from "@/constants/roles";
import { AddEditClubModal } from "./AddEditClubModal";
import { toast } from "sonner";

export function AdminClubsSection() {
  const { t } = useTranslation();
  const hasAccess = useHasRoleOrAbove(ROLES.CLUB_ADMIN);
  const { data, isLoading } = useAdminClubs(hasAccess);

  const [modalOpen, setModalOpen] = useState(false);
  const [editClubId, setEditClubId] = useState<string | null>(null);

  const clubs = data?.clubs ?? [];

  const handleAddClub = () => {
    if (!hasAccess) {
      toast.error(t("settings.adminClubsUpgradeRoleToast"));
      return;
    }
    setEditClubId(null);
    setModalOpen(true);
  };

  const handleEditClub = (clubId: string) => {
    if (!hasAccess) {
      toast.error(t("settings.adminClubsUpgradeRoleToast"));
      return;
    }
    setEditClubId(clubId);
    setModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditClubId(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">
            {t("settings.adminClubsTitle")}
          </h2>
          <Button
            type="button"
            onClick={handleAddClub}
            className="h-10 shrink-0 rounded-lg bg-[#facc15] px-4 font-medium text-black hover:bg-[#e6b800]"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("settings.adminClubsAddButton")}
          </Button>
        </div>

        {hasAccess && isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          </div>
        ) : !hasAccess ? (
          <p className="text-sm text-muted-foreground">
            {t("settings.adminClubsPlaceholder")}
          </p>
        ) : clubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("settings.adminClubsPlaceholder")}
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">
                    {club.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.adminClubsCourts")}: {club.courtCount}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded border border-[#e5e7eb] bg-white text-muted-foreground hover:bg-[#f3f4f6] hover:text-foreground"
                  onClick={() => handleEditClub(club.id)}
                  aria-label={t("settings.adminClubsEditAria", { name: club.name })}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddEditClubModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        editClubId={editClubId}
      />
    </>
  );
}
