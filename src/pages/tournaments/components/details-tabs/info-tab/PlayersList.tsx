import { useId, useMemo, useState, type ReactNode } from "react";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { PlayerNameText } from "@/components/shared/PlayerNameText";
import { ChevronDown, ChevronUp, UserCircle2 } from "@/icons/figma-icons";
import { useAuth } from "@/pages/auth/hooks";
import type { TournamentParticipant } from "@/models/tournament/types";
import {
  buildDoublesPairsResponse,
  loadDoublesPartnerById,
  sanitizeDoublesPartnerById,
  saveDoublesPartnerById,
  type DoublesPartnerById,
} from "@/pages/tournaments/schedule/helpers/doublesPairingState";
import { UI_LIMITS } from "./constants";

interface PlayersListProps {
  tournamentId: string;
  participants: TournamentParticipant[];
  participantSummary: string;
  hasParticipants: boolean;
  isPlayersCollapsible: boolean;
  isPlayersListExpanded: boolean;
  onToggle: () => void;
  t: TFunction;
}

function getPlayersContent({
  participants,
  participantSummary,
  hasParticipants,
  isPlayersCollapsible,
  isPlayersListExpanded,
  safePartnerById,
  currentUserId,
  onTogglePartner,
  t,
}: Omit<PlayersListProps, "onToggle" | "tournamentId"> & {
  safePartnerById: DoublesPartnerById;
  currentUserId: string | null;
  onTogglePartner: (participantId: string) => void;
}): ReactNode {
  if (!hasParticipants) {
    return <p className="text-[14px] text-[#010a04]/60">{t("tournaments.noPlayersYet")}</p>;
  }

  if (isPlayersListExpanded || !isPlayersCollapsible) {
    return (
      <div className="grid grid-cols-2 gap-[10px] sm:gap-[14px]">
        {participants.map((participant) => {
          const nameTrimmed = participant.name?.trim() ?? "";
          const aliasTrimmed = participant.alias?.trim() ?? "";
          const isPaired = Boolean(safePartnerById[participant.id]);
          const isCurrentUser = currentUserId === participant.id;
          const partnerId = safePartnerById[participant.id];
          const partner = partnerId
            ? participants.find((item) => item.id === partnerId) ?? null
            : null;
          const partnerName = partner
            ? partner.alias?.trim() || partner.name?.trim() || t("tournaments.unknownPlayer")
            : null;
          const displayName = nameTrimmed || aliasTrimmed || t("tournaments.unknownPlayer");
          const subtitleText = partnerName
            ? `${displayName} / ${partnerName}`
            : aliasTrimmed || t("tournaments.participantNoAlias");

          return (
            <button
              key={participant.id}
              type="button"
              onClick={() => onTogglePartner(participant.id)}
              className={`flex w-full items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left transition-colors sm:gap-5 sm:px-[15px] sm:py-3 ${
                isPaired
                  ? "border-[#067429]/45 bg-[#0a6925]/15"
                  : isCurrentUser
                    ? "border-[#067429]/20 bg-[#f2fbf4] hover:bg-[#e4f7e9]"
                    : "border-[#010a04]/[0.08] bg-white hover:bg-[#f3f4f6]"
              }`}
              aria-label={t("tournaments.scheduleDoublesSelectParticipant", { name: displayName })}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[20px] border-[1.5px] border-[#010a04] bg-[#dddddd]/60 sm:h-10 sm:w-10">
                <UserCircle2 size={30} className="text-[#010a04]" />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <PlayerNameText
                    name={displayName}
                    className="text-[14px] leading-5 sm:text-[16px]"
                    focusable={false}
                  />
                  {isCurrentUser ? (
                    <span className="rounded-[6px] border border-[#010a04]/20 px-1.5 py-0.5 text-[10px] font-medium uppercase text-[#010a04]/70">
                      {t("tournaments.scheduleDoublesYou")}
                    </span>
                  ) : null}
                </div>
                <PlayerNameText
                  name={subtitleText}
                  className="text-[14px] leading-[18px] text-[#6a6a6a]"
                  focusable
                />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  const preview = participantSummary.slice(0, UI_LIMITS.DESCRIPTION_PREVIEW);
  return (
    <p className="text-[14px] leading-5 text-[#010a04]">
      {participantSummary.length > UI_LIMITS.DESCRIPTION_PREVIEW ? `${preview}…` : preview}
    </p>
  );
}

export function PlayersList({
  tournamentId,
  participants,
  participantSummary,
  hasParticipants,
  isPlayersCollapsible,
  isPlayersListExpanded,
  onToggle,
  t,
}: PlayersListProps) {
  const { user } = useAuth();
  const [partnerById, setPartnerById] = useState<DoublesPartnerById>(() =>
    sanitizeDoublesPartnerById(loadDoublesPartnerById(tournamentId), participants)
  );
  const id = useId();
  const headingId = `${id}-heading`;
  const contentId = `${id}-content`;

  const safePartnerById = useMemo(
    () => sanitizeDoublesPartnerById(partnerById, participants),
    [partnerById, participants]
  );

  const pairsPreview = useMemo(
    () => buildDoublesPairsResponse(participants, safePartnerById),
    [participants, safePartnerById]
  );

  const persistPartnerById = (next: DoublesPartnerById) => {
    setPartnerById(next);
    saveDoublesPartnerById(tournamentId, next);
  };

  const onTogglePartner = (participantId: string) => {
    const currentUserId = user?.id ?? null;
    if (!currentUserId) {
      toast.error(t("tournaments.scheduleDoublesNoCurrentUser"));
      return;
    }

    const meExists = participants.some((participant) => participant.id === currentUserId);
    if (!meExists) {
      toast.error(t("tournaments.scheduleDoublesCurrentUserNotParticipant"));
      return;
    }

    if (participantId === currentUserId) {
      const currentPartner = safePartnerById[currentUserId];
      if (!currentPartner) {
        return;
      }
      const next = { ...safePartnerById };
      delete next[currentUserId];
      delete next[currentPartner];
      persistPartnerById(next);
      toast.success(t("tournaments.scheduleDoublesPairDismissed"));
      return;
    }

    const targetParticipant = participants.find((participant) => participant.id === participantId);
    if (!targetParticipant) {
      return;
    }

    const currentPartnerId = safePartnerById[currentUserId];
    if (currentPartnerId && currentPartnerId !== participantId) {
      toast.error(t("tournaments.scheduleDoublesDismissCurrentPairFirst"));
      return;
    }
    const targetPartnerId = safePartnerById[participantId];
    if (targetPartnerId && targetPartnerId !== currentUserId) {
      toast.error(t("tournaments.scheduleDoublesTargetAlreadyPaired"));
      return;
    }

    const next = { ...safePartnerById };
    if (currentPartnerId === participantId && targetPartnerId === currentUserId) {
      delete next[currentUserId];
      delete next[participantId];
      persistPartnerById(next);
      toast.success(t("tournaments.scheduleDoublesPairDismissed"));
      return;
    }

    next[currentUserId] = participantId;
    next[participantId] = currentUserId;
    persistPartnerById(next);
    toast.success(t("tournaments.scheduleDoublesPairCreated"));
  };

  const playersContent = getPlayersContent({
    participants,
    participantSummary,
    hasParticipants,
    isPlayersCollapsible,
    isPlayersListExpanded,
    safePartnerById,
    currentUserId: user?.id ?? null,
    onTogglePartner,
    t,
  });

  return (
    <section className="py-4 sm:py-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[20px] font-semibold text-[#010a04]" id={headingId}>
          {t("tournaments.currentPlayers")}
        </h3>
        {isPlayersCollapsible ? (
          <button
            type="button"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-[#010a04]/25 text-[#010a04] transition-colors hover:bg-[#010a04]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#010a04]/25"
            aria-expanded={isPlayersListExpanded}
            aria-controls={contentId}
            aria-label={
              isPlayersListExpanded ? t("tournaments.collapsePlayerList") : t("tournaments.expandPlayerList")
            }
            onClick={onToggle}
          >
            {isPlayersListExpanded ? (
              <ChevronUp size={16} className="text-[#010a04]" aria-hidden />
            ) : (
              <ChevronDown size={16} className="text-[#010a04]" aria-hidden />
            )}
          </button>
        ) : null}
      </div>

      <div id={contentId} aria-labelledby={headingId}>
        {playersContent}
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-[16px] font-semibold text-[#010a04]">
          {t("tournaments.schedulePairsTitle", { defaultValue: "Pairs" })}
        </h4>
        {pairsPreview.teams.length > 0 ? (
          <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 sm:gap-[14px]">
            {pairsPreview.teams.map((team) => (
              <div
                key={`pair-${team.team}`}
                className="flex items-center gap-3 rounded-[12px] border border-[#067429]/45 bg-[#0a6925]/15 px-3 py-2.5 sm:gap-5 sm:px-[15px] sm:py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[20px] border-[1.5px] border-[#010a04] bg-[#dddddd]/60 sm:h-10 sm:w-10">
                  <UserCircle2 size={30} className="text-[#010a04]" />
                </div>
                <PlayerNameText
                  name={`${team.players[0]?.alias ?? team.players[0]?.name ?? t("tournaments.unknownPlayer")} / ${team.players[1]?.alias ?? team.players[1]?.name ?? t("tournaments.unknownPlayer")}`}
                  className="text-[14px] leading-5 text-[#010a04] sm:text-[16px]"
                  focusable
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-[#010a04]/60">
            {t("tournaments.scheduleNoPairsYet", { defaultValue: "No pairs selected yet." })}
          </p>
        )}
      </div>
    </section>
  );
}
