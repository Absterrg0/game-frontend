import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/api/queryKeys";
import { toBackendCreateInput, toBackendUpdateInput } from "./mappers";
import {
  createTournamentResponseSchema,
  joinTournamentResponseSchema,
  leaveTournamentResponseSchema,
  publishTournamentPayloadSchema,
  publishTournamentResponseSchema,
  updateTournamentResponseSchema,
  type CreateTournamentInput,
  type CreateTournamentResponse,
  type JoinTournamentResponse,
  type TournamentDetailResponse,
  type LeaveTournamentResponse,
  type PublishTournamentPayload,
  type UpdateTournamentInput,
  type UpdateTournamentResponse,
} from "@/models/tournament/types";

function calculateParticipationPercentage(spotsFilled: number, spotsTotal: number): number {
  if (spotsTotal <= 0) {
    return 0;
  }
  const percentage = Math.round((spotsFilled / spotsTotal) * 100);
  return Math.max(0, Math.min(100, percentage));
}

function applyParticipationServerUpdate(
  currentData: TournamentDetailResponse,
  participation: JoinTournamentResponse["tournament"] | LeaveTournamentResponse["tournament"]
): TournamentDetailResponse {
  const { tournament } = currentData;
  const spotsFilled = participation.spotsFilled;
  const spotsTotal = participation.spotsTotal;
  const isParticipant = participation.isParticipant;

  return {
    ...currentData,
    tournament: {
      ...tournament,
      progress: {
        ...tournament.progress,
        spotsFilled,
        spotsTotal,
        percentage: calculateParticipationPercentage(spotsFilled, spotsTotal),
      },
      permissions: {
        ...tournament.permissions,
        isParticipant,
        canJoin: isParticipant ? false : spotsFilled < spotsTotal,
      },
    },
  };
}

async function createTournament(data: CreateTournamentInput): Promise<CreateTournamentResponse> {
  const payload = toBackendCreateInput(data);
  const res = await api.post("/api/tournaments", payload);
  return createTournamentResponseSchema.parse(res.data);
}

async function updateTournament(id: string, data: UpdateTournamentInput): Promise<UpdateTournamentResponse> {
  const payload = toBackendUpdateInput(data);
  const res = await api.patch(`/api/tournaments/${id}`, payload);
  return updateTournamentResponseSchema.parse(res.data);
}

async function publishTournament(id: string, data: PublishTournamentPayload = {}) {
  const parsed = publishTournamentPayloadSchema.parse(data);
  const payload = toBackendUpdateInput(parsed);
  const res = await api.post(`/api/tournaments/${id}/publish`, payload);
  return publishTournamentResponseSchema.parse(res.data);
}

async function joinTournament(id: string): Promise<JoinTournamentResponse> {
  const res = await api.post(`/api/tournaments/${id}/join`);
  return joinTournamentResponseSchema.parse(res.data);
}

async function leaveTournament(id: string): Promise<LeaveTournamentResponse> {
  const res = await api.post(`/api/tournaments/${id}/leave`);
  return leaveTournamentResponseSchema.parse(res.data);
}

export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.all });
    },
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTournamentInput }) => updateTournament(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.detail(id) });
    },
  });
}

export function usePublishTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: PublishTournamentPayload }) => publishTournament(id, data ?? {}),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.detail(id) });
    },
  });
}

export function useJoinTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => joinTournament(id),
    onSuccess: (response, { id }) => {
      const queryKey = queryKeys.tournament.detail(id);
      queryClient.setQueryData<TournamentDetailResponse>(queryKey, (currentData) => {
        if (!currentData) {
          return currentData;
        }
        return applyParticipationServerUpdate(currentData, response.tournament);
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.all });
    },
  });
}

export function useLeaveTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => leaveTournament(id),
    onSuccess: (response, { id }) => {
      const queryKey = queryKeys.tournament.detail(id);
      queryClient.setQueryData<TournamentDetailResponse>(queryKey, (currentData) => {
        if (!currentData) {
          return currentData;
        }
        return applyParticipationServerUpdate(currentData, response.tournament);
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tournament.all });
    },
  });
}
