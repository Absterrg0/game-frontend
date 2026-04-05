import type { Locale } from "date-fns";
import type { TournamentDetail } from "@/models/tournament/types";
import { formatDateOrFallback } from "@/utils/date";
import { formatTimeTo12Hour } from "@/utils/time";
import type { DerivedMatch, MatchCounts, MatchStatus } from "./types";

function participantName(name: string | null, alias: string | null, fallback: string) {
  return name || alias || fallback;
}

function scheduleText(
  date: string | null,
  startTime: string | null,
  tbdLabel: string,
  locale: Locale | undefined
) {
  const time = formatTimeTo12Hour(startTime);

  if (!date) return time ?? tbdLabel;

  const dateLabel = formatDateOrFallback(date, tbdLabel, "P", locale);
  return `${time ?? tbdLabel} (${dateLabel})`;
}

export const MATCH_STATUS_KEYS: Record<MatchStatus, string> = {
  completed: "tournaments.matchStatusCompleted",
  inProgress: "tournaments.matchStatusInProgress",
  scheduled: "tournaments.matchStatusScheduled",
};

export function statusClassName(status: MatchStatus) {
  if (status === "completed") return "bg-[#dcfce7] text-[#15803d]";
  if (status === "inProgress") return "bg-[#dbeafe] text-[#1d4ed8]";
  return "bg-[#f3f4f6] text-[#6b7280]";
}

export function deriveMatches(
  tournament: TournamentDetail,
  currentUserId: string | null,
  t: (key: string, options?: Record<string, unknown>) => string,
  locale: Locale | undefined
): DerivedMatch[] {
  const pairs: DerivedMatch[] = [];
  const participants = tournament.participants;
  const tbdLabel = t("tournaments.scheduledTbd");

  for (let index = 0; index < participants.length; index += 2) {
    const first = participants[index];
    const second = participants[index + 1];
    if (!first) continue;

    const status: MatchStatus = index % 6 === 0 ? "completed" : index % 6 === 2 ? "inProgress" : "scheduled";
    const court = tournament.courts[(index / 2) % Math.max(1, tournament.courts.length)];

    const isMine = !!currentUserId && (first.id === currentUserId || (second && second.id === currentUserId));

    pairs.push({
      id: `${first.id}-${second?.id ?? "bye"}`,
      playerA: participantName(first.name, first.alias, t("tournaments.playerAFallback")),
      playerB: participantName(second?.name ?? null, second?.alias ?? null, t("tournaments.playerBFallback")),
      courtName: court?.name || t("tournaments.courtFallback", { number: Math.floor(index / 2) + 1 }),
      status,
      isMine,
      scheduledText: scheduleText(tournament.date, tournament.startTime, tbdLabel, locale),
    });
  }

  return pairs;
}

export function getMatchCounts(matches: DerivedMatch[]): MatchCounts {
  const completedCount = matches.filter((match) => match.status === "completed").length;
  const inProgressCount = matches.filter((match) => match.status === "inProgress").length;
  const scheduledCount = matches.filter((match) => match.status === "scheduled").length;
  const progressPct = matches.length ? Math.round((completedCount / matches.length) * 100) : 0;

  return {
    completedCount,
    inProgressCount,
    scheduledCount,
    progressPct,
  };
}
