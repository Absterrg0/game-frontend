import type { TournamentDetail } from "@/models/tournament/types";
import type { ParticipantResult } from "./types";

function participantDisplayName(name: string | null, alias: string | null, fallback: string) {
  return name || alias || fallback;
}

export function deriveResults(tournament: TournamentDetail, unknownLabel: string): ParticipantResult[] {
  const participants = tournament.participants;
  if (participants.length === 0) return [];

  const withScores: ParticipantResult[] = participants.map((participant, index) => {
    const wins = (index * 3 + 1) % 9;
    const totalScoreAdvantage = (index * 5 + 7) % 30 + 5;
    const positionChange = index % 5 === 0 ? 2 : index % 5 === 1 ? -1 : 0;

    return {
      id: participant.id,
      name: participantDisplayName(participant.name, participant.alias, unknownLabel),
      wins,
      totalScoreAdvantage,
      positionChange,
    };
  });

  return withScores.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.totalScoreAdvantage - a.totalScoreAdvantage;
  });
}
