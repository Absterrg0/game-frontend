import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import InlineLoader from "@/components/shared/InlineLoader";
import { cn } from "@/lib/utils";
import type { AdminClub } from "@/pages/clubs/hooks";
import type { ClubSubscriptionStatus } from "@/pages/admin/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ManageClubInfoCard } from "./ManageClubInfoCard";

export type SidebarStatusFilter =
  | "all"
  | "subscription"
  | "no_subscription";

function parseSidebarStatusFilter(value: string): SidebarStatusFilter | null {
  switch (value) {
    case "all":
    case "subscription":
    case "no_subscription":
      return value;
    default:
      return null;
  }
}

function toSidebarStatusCategory(
  status?: ClubSubscriptionStatus
): "subscription" | "no_subscription" {
  return status === "subscribed" ? "subscription" : "no_subscription";
}

export interface ManageClubSidebarClub extends AdminClub {
  subscriptionStatus?: ClubSubscriptionStatus;
  subscriptionExpiresAt?: Date | null;
}

interface ManageClubSidebarProps {
  clubs: ManageClubSidebarClub[];
  clubsLoading: boolean;
  effectiveClubId: string | null;
  mobileView: "clubs" | "staff";
  isSuperAdminView: boolean;
  statusFilter: SidebarStatusFilter;
  onStatusFilterChange: (value: SidebarStatusFilter) => void;
  onClubSelect: (clubId: string) => void;
}

function statusChipClassName(status?: ClubSubscriptionStatus): string {
  const category = toSidebarStatusCategory(status);

  if (category === "subscription") {
    return "bg-[rgba(10,105,37,0.12)] text-[#067429]";
  }

  return "bg-black/6 text-[#010a04]/70";
}

function statusLabel(t: (key: string) => string, status?: ClubSubscriptionStatus): string {
  const category = toSidebarStatusCategory(status);
  return category === "subscription"
    ? t("manageClub.statusSubscription")
    : t("manageClub.statusNothing");
}

export function ManageClubSidebar({
  clubs,
  clubsLoading,
  effectiveClubId,
  mobileView,
  isSuperAdminView,
  statusFilter,
  onStatusFilterChange,
  onClubSelect,
}: ManageClubSidebarProps) {
  const { t } = useTranslation();
  const showFilteredEmptyState = isSuperAdminView && statusFilter !== "all";
  const handleStatusFilterChange = (value: string) => {
    const parsed = parseSidebarStatusFilter(value);
    if (!parsed) return;
    onStatusFilterChange(parsed);
  };

  return (
    <aside className={cn("w-full lg:w-[312px]", mobileView === "staff" && "hidden lg:block")}>
      <div className="rounded-[12px] border border-black/8 bg-white px-[15px] py-5 shadow-[0px_3px_15px_0px_rgba(0,0,0,0.06)]">
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg leading-[1] font-semibold text-[#010a04]">{t("manageClub.allClubs")}</h2>
            </div>
            {isSuperAdminView && (
              <div className="hidden sm:block">
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="h-[34px] w-[132px] rounded-[8px] border-black/10 text-[13px] text-[#010a04]">
                    <SelectValue placeholder={t("manageClub.allStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("manageClub.allStatus")}</SelectItem>
                    <SelectItem value="subscription">{t("manageClub.statusSubscription")}</SelectItem>
                    <SelectItem value="no_subscription">{t("manageClub.statusNothing")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {isSuperAdminView && (
            <div className="sm:hidden">
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="h-[34px] w-full rounded-[8px] border-black/10 text-[13px] text-[#010a04]">
                  <SelectValue placeholder={t("manageClub.allStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("manageClub.allStatus")}</SelectItem>
                  <SelectItem value="subscription">{t("manageClub.statusSubscription")}</SelectItem>
                  <SelectItem value="no_subscription">{t("manageClub.statusNothing")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {clubsLoading ? (
          <div className="flex justify-center py-8">
            <InlineLoader />
          </div>
        ) : clubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {showFilteredEmptyState
              ? t("manageClub.noClubsForSelectedStatus")
              : t("manageClub.noClubs")}
          </p>
        ) : (
          <div className="space-y-1 overflow-hidden rounded-[8px] border border-black/10">
            {clubs.map((club) => {
              const isSelected = club.id === effectiveClubId;

              return (
                <button
                  key={club.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => onClubSelect(club.id)}
                  className={cn(
                    "flex w-full items-center justify-between border-b border-black/10 px-[12px] py-[15px] text-left last:border-b-0",
                    isSelected ? "bg-[rgba(10,105,37,0.04)] lg:border-l-[3px] lg:border-l-brand-primary lg:pl-[9px]" : "bg-white hover:bg-[#fafafa]"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#d4d4d4]" />
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-medium text-[#010a04]">{club.name}</p>
                      <p className="text-[12px] text-[#010a04]/60">
                        {t("manageClub.membersCount", { count: club.membersCount ?? 0 })} •{" "}
                        {t("manageClub.eventsCount", { count: club.eventsCount ?? 0 })}
                      </p>
                      {isSuperAdminView && (
                        <>
                          <span
                            className={cn(
                              "mt-1 inline-flex rounded-[4px] px-[6px] py-[1px] text-[10px] font-medium",
                              statusChipClassName(club.subscriptionStatus)
                            )}
                          >
                            {statusLabel(t, club.subscriptionStatus)}
                          </span>
                          <p className="mt-1 text-[11px] text-[#010a04]/45">
                            {t("manageClub.expiresOn")}: {club.subscriptionExpiresAt ? format(club.subscriptionExpiresAt, "dd/MM/yyyy") : "--"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="shrink-0 text-[#010a04]/45 lg:hidden" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 hidden lg:block">
        <ManageClubInfoCard />
      </div>
    </aside>
  );
}
