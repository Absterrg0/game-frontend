export type MatchStatus = "completed" | "inProgress" | "scheduled";

export interface DerivedMatch {
  id: string;
  playerA: string;
  playerB: string;
  courtName: string;
  status: MatchStatus;
  isMine: boolean;
  scheduledText: string;
}

export interface MatchCounts {
  completedCount: number;
  inProgressCount: number;
  scheduledCount: number;
  progressPct: number;
}
