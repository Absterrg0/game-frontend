import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CreateTournamentModal } from "@/components/tournaments/CreateTournamentModal";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Settings01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { useTournaments, useAdminClubs } from "@/hooks";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
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
import InlineLoader from "@/components/shared/InlineLoader";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";

export default function TournamentListPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isProfileComplete, loading } = useAuth();
  const [filters, setFilters] = useState<{
    status?: string;
    clubId?: string;
    page: number;
    limit: number;
    q?: string;
  }>({ page: 1, limit: 10 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading } = useTournaments(filters);
  const { data: adminClubsData } = useAdminClubs();
  const clubs = adminClubsData?.clubs ?? [];

  const tournaments = data?.tournaments ?? [];
  const pagination = data?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  const formatDate = (d: string | null) => {
    if (!d) return t("tournaments.unscheduled");
    try {
      const parsed = typeof d === "string" ? parseISO(d) : new Date(d);
      return isValid(parsed) ? format(parsed, "d MMM, yyyy") : t("tournaments.unscheduled");
    } catch {
      return t("tournaments.unscheduled");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <InlineLoader />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isProfileComplete) return <Navigate to="/information" replace />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-gray-50">
      <div className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold text-foreground">
              {t("tournaments.allTournaments")}
            </h1>
            <div className="flex items-center gap-2">
              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HugeiconsIcon icon={Settings01Icon} size={16} className="mr-2" />
                    {t("tournaments.filters")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-muted-foreground">
                        {t("tournaments.filterStatus")}
                      </label>
                      <Select
                        value={filters.status ?? "all"}
                        onValueChange={(v) =>
                          setFilters((prev) => ({
                            ...prev,
                            status: v === "all" ? undefined : v,
                            page: 1,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("tournaments.allStatuses")}</SelectItem>
                          <SelectItem value="active">{t("tournaments.statusActive")}</SelectItem>
                          <SelectItem value="draft">{t("tournaments.statusDraft")}</SelectItem>
                          <SelectItem value="inactive">{t("tournaments.statusInactive")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-muted-foreground">
                        {t("tournaments.filterClub")}
                      </label>
                      <Select
                        value={filters.clubId ?? "all"}
                        onValueChange={(v) =>
                          setFilters((prev) => ({
                            ...prev,
                            clubId: v === "all" ? undefined : v,
                            page: 1,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("tournaments.allClubs")}</SelectItem>
                          {clubs.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setFiltersOpen(false)}
                    >
                      {t("tournaments.applyFilters")}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                className="bg-brand-primary hover:bg-brand-primary-hover"
                onClick={() => setCreateModalOpen(true)}
              >
                <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-2" />
                {t("tournaments.create")}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <InlineLoader />
            </div>
          ) : tournaments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">{t("tournaments.noTournaments")}</p>
         
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground w-12">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("tournaments.tournamentName")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("tournaments.club")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("tournaments.date")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("tournaments.action")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tournament, idx) => (
                    <tr
                      key={tournament.id}
                      className="border-b border-border bg-card transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 shrink-0 rounded-full",
                              tournament.status === "active" ? "bg-green-500" : "bg-muted-foreground/40"
                            )}
                          />
                          <span className="font-medium text-foreground">{tournament.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {tournament.club?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(tournament.date)}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/tournaments/${tournament.id}`}>
                            <HugeiconsIcon icon={ViewIcon} size={16} className="mr-1" />
                            {t("tournaments.view")}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <p className="text-sm text-muted-foreground">
                {t("tournaments.paginationInfo", {
                  from: (pagination.page - 1) * pagination.limit + 1,
                  to: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total,
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                  }
                >
                  {t("tournaments.prev")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.min(pagination.totalPages, prev.page + 1),
                    }))
                  }
                >
                  {t("tournaments.next")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateTournamentModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
