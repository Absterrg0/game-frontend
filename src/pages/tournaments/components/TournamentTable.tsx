import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Calendar, EyeIcon, PencilEdit01Icon } from "@/icons/figma-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  TournamentListItem,
  TournamentPagination,
  TournamentStatus,
} from "@/models/tournament";
import { formatDateDisplay } from "@/utils/display";
import { getDateFnsLocale } from "@/lib/dateFnsLocale";
import type { TFunction } from "i18next";

interface TournamentTableProps {
  tournaments: TournamentListItem[];
  pagination: TournamentPagination;
  language: string;
  listHeading: string;
}

const STATUS_DOTS: Record<TournamentStatus, string> = {
  active: "bg-emerald-500",
  draft: "bg-amber-400",
};

function getStatusLabel(status: TournamentStatus, t: TFunction) {
  switch (status) {
    case "active":
      return t("tournaments.statusActive");
    case "draft":
      return t("tournaments.statusDraft");
    default:
      return "";
  }
}

export function TournamentTable({
  tournaments,
  pagination,
  language,
  listHeading,
}: TournamentTableProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="px-4 pb-4 sm:px-5 lg:hidden" role="list" aria-label={listHeading}>
        <div className="flex flex-col gap-[15px]">
          {tournaments.map((tournament) => {
            const statusLabel = getStatusLabel(tournament.status, t);
            const statusDotClass = STATUS_DOTS[tournament.status];
            const rowPath = `/tournaments/${tournament.id}`;
            const rowAriaLabel = t("tournaments.openTournamentRow", {
              name: tournament.name,
            });
            const dateText = formatDateDisplay(
              tournament.date,
              t("tournaments.unscheduled"),
              getDateFnsLocale(language)
            );
            const isDraft = tournament.status === "draft";

            return (
              <Link
                key={tournament.id}
                to={rowPath}
                role="listitem"
                aria-label={rowAriaLabel}
                className={cn(
                  "block rounded-[10px] bg-[rgba(1,10,4,0.04)] p-[14px] text-inherit no-underline transition-colors",
                  "hover:bg-[rgba(1,10,4,0.07)] active:bg-[rgba(1,10,4,0.09)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/45"
                )}
              >
                <div className="flex items-center gap-[15px]">
                  <span
                    className="h-[45px] w-[45px] shrink-0 rounded-[7px] bg-[#d9d9d9]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-[6px]">
                      <span className="line-clamp-2 text-[16px] font-medium leading-[1.2] text-[#010a04]">
                        {tournament.name}
                      </span>
                      <span
                        role="img"
                        className={cn("mt-[6px] h-2 w-2 shrink-0 rounded-full", statusDotClass)}
                        aria-label={statusLabel}
                        title={statusLabel}
                      />
                    </div>
                    <div className="mt-[9px] flex items-center gap-[10px] text-[13px] text-[#010a04]/75 sm:text-[14px]">
                      <Calendar size={17} className="text-[#010a04]/60" />
                      <span>{dateText}</span>
                    </div>
                  </div>
                </div>

                <div className="my-[14px] h-px w-full bg-[#010a04]/10" />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-6 w-6 shrink-0 rounded-full bg-[#d9d9d9]"
                      aria-hidden="true"
                    />
                    <span className="truncate text-[14px] text-[#010a04]">
                      {tournament.club?.name ?? "-"}
                    </span>
                  </div>

                  <span className="flex shrink-0 items-center gap-2 text-[14px] text-[#010a04]">
                    {isDraft ? (
                      <PencilEdit01Icon size={16} className="text-[#010a04]" />
                    ) : (
                      <EyeIcon className="size-4 text-[#010a04]" />
                    )}
                    {isDraft ? t("tournaments.edit") : t("tournaments.view")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="hidden overflow-x-auto border-y border-black/10 lg:block">
        <Table className="min-w-[860px] table-fixed">
          <TableHeader>
            <TableRow className="h-[35px] border-black/10 bg-black/5 hover:bg-black/5">
              <TableHead className="h-[35px] w-12 px-4 py-0 text-left text-xs font-normal text-foreground/80">
                #
              </TableHead>
              <TableHead className="h-[35px] w-[42%] px-3 py-0 text-left text-xs font-normal text-foreground/80">
                {t("tournaments.tournamentName")}
              </TableHead>
              <TableHead className="h-[35px] w-[38%] px-3 py-0 text-left text-xs font-normal text-foreground/80">
                {t("tournaments.club")}
              </TableHead>
              <TableHead className="h-[35px] w-[20%] px-3 py-0 text-left text-xs font-normal text-foreground/80">
                {t("tournaments.date")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.map((tournament, idx) => {
              const statusLabel = getStatusLabel(tournament.status, t);
              const statusDotClass = STATUS_DOTS[tournament.status];
              const rowPath = `/tournaments/${tournament.id}`;
              const rowAriaLabel = t("tournaments.openTournamentRow", {
                name: tournament.name,
              });

              return (
                <TableRow
                  key={tournament.id}
                  className="h-[45px] border-black/10 bg-card"
                >
                  <TableCell colSpan={4} className="p-0">
                    <Link
                      to={rowPath}
                      aria-label={rowAriaLabel}
                      className={cn(
                        "grid h-[45px] w-full grid-cols-[3rem_minmax(0,42fr)_minmax(0,38fr)_minmax(0,20fr)] items-center border-black/10 bg-card text-inherit no-underline transition-colors",
                        "hover:bg-black/[0.015] focus-visible:bg-black/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary/50"
                      )}
                    >
                      <span className="px-4 py-0 text-xs text-foreground/90">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </span>
                      <span className="block min-w-0 px-3 py-0">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-[22px] w-[22px] shrink-0 rounded-[5px] bg-black/15"
                            aria-hidden="true"
                          />
                          <span className="truncate text-sm text-foreground">
                            {tournament.name}
                          </span>
                          <span
                            role="img"
                            className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass}`}
                            aria-label={statusLabel}
                            title={statusLabel}
                          />
                        </span>
                      </span>
                      <span className="block min-w-0 px-3 py-0">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-4 w-4 shrink-0 rounded-full bg-black/15"
                            aria-hidden="true"
                          />
                          <span className="truncate text-sm text-foreground">
                            {tournament.club?.name ?? "-"}
                          </span>
                        </span>
                      </span>
                      <span className="px-3 py-0 text-sm text-foreground/90">
                        {formatDateDisplay(
                          tournament.date,
                          t("tournaments.unscheduled"),
                          getDateFnsLocale(language)
                        )}
                      </span>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
