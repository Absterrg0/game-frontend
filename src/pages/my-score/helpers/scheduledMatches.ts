import type { MyScoreFilterMode } from "@/models/myScore/types";
import type { TournamentLiveMatchItem } from "@/models/tournament/types";

function isActiveScheduledMatch(match: TournamentLiveMatchItem): boolean {
  return match.status !== "completed" && match.status !== "cancelled";
}

export function filterScheduledMatchesForMyScore(
  matches: TournamentLiveMatchItem[],
  mode: MyScoreFilterMode
): TournamentLiveMatchItem[] {
  const filtered = matches.filter((match) => {
    if (!isActiveScheduledMatch(match)) {
      return false;
    }
    return mode === "all" || match.mode === mode;
  });

  return [...filtered].sort((left, right) => {
    const leftTime = left.startTime ? Date.parse(left.startTime) : Number.NEGATIVE_INFINITY;
    const rightTime = right.startTime ? Date.parse(right.startTime) : Number.NEGATIVE_INFINITY;
    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }
    return left.id.localeCompare(right.id);
  });
}

/** Warm highlight for upcoming fixtures (matches tournament schedule cards). */
export const MY_SCORE_SCHEDULED_SURFACE_CLASS =
  "border-[#b45309]/25 bg-[#fffaf3]";

export const MY_SCORE_SCHEDULED_SURFACE_HOVER_CLASS = "hover:bg-[#fff6eb]";

export function buildTournamentRecordScorePath(match: TournamentLiveMatchItem): string | null {
  const tournamentId = match.tournament.id?.trim();
  if (!tournamentId) {
    return null;
  }

  const params = new URLSearchParams({
    tournamentId,
    matchId: match.id,
  });
  return `/record-score/manual?${params.toString()}`;
}

export function matchNeedsRecordScoreShortcut(match: TournamentLiveMatchItem): boolean {
  return (
    Boolean(match.tournament.id?.trim()) &&
    match.status !== "completed" &&
    match.status !== "cancelled"
  );
}
