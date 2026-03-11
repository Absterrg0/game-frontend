import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/api/queryKeys";

export interface TournamentDetail {
  id: string;
  name: string;
  logo: string | null;
  club: unknown;
  sponsorId: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  playMode: string;
  tournamentMode: string;
  memberFee: number;
  externalFee: number;
  minMember: number;
  maxMember: number;
  playTime: string | null;
  pauseTime: string | null;
  courts: unknown[];
  foodInfo: string;
  descriptionInfo: string;
  numberOfRounds: number;
  roundTimings: { startDate?: string; endDate?: string }[];
  status: "active" | "draft" | "inactive";
  participants: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

interface TournamentDetailResponse {
  tournament: TournamentDetail;
}

async function fetchTournamentById(id: string): Promise<TournamentDetailResponse> {
  const res = await api.get<TournamentDetailResponse>(`/api/tournaments/${id}`);
  return res.data;
}

export function useTournamentById(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tournament.detail(id ?? ""),
    queryFn: () => fetchTournamentById(id!),
    enabled: !!id && enabled,
  });
}
