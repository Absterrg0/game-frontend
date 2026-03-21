import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminClubs } from "@/pages/clubs/hooks";
import { AddEditClubModal } from "./AddEditClubModal";
import InlineLoader from "@/components/shared/InlineLoader";

export function AdminClubsSection() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useAdminClubs(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editClubId, setEditClubId] = useState<string | null>(null);

  const clubs = data?.clubs ?? [];

  const handleAddClub = () => {
    setEditClubId(null);
    setModalOpen(true);
  };

  const handleEditClub = (clubId: string) => {
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
          <h2 className="text-[20px] font-semibold text-[#010a04]">
            {t("settings.clubsIAdministrate")}
          </h2>
          <Button
            type="button"
            onClick={handleAddClub}
            className="h-[30px] shrink-0 rounded-[8px] border border-[rgba(1,10,4,0.12)] bg-brand-accent px-[15px] py-2 text-[12px] font-medium text-[#010a04] hover:bg-brand-accent-hover"
          >
            {t("settings.adminClubsAddButton")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <InlineLoader />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive" role="alert">
            {t("settings.adminClubsLoadError")}
          </p>
        ) : clubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("settings.adminClubsPlaceholder")}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-[#e1e3e8] bg-[#f9fafc] pl-[14px] pr-5 py-[14px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-medium text-[#010a04]">
                    {club.name}
                  </p>
                  <p className="text-[14px] font-normal text-[#010a04]">
                    {t("settings.adminClubsCourts")}: {club.courtCount}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[#010a04]/45 hover:text-[#010a04]/70"
                  onClick={() => handleEditClub(club.id)}
                  aria-label={t("settings.adminClubsEditAria", { name: club.name })}
                >
                  <SquarePen size={18} strokeWidth={1.7} />
                </button>
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
