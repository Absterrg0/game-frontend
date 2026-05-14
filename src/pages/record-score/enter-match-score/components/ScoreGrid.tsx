import { useMemo, type CSSProperties } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getScoreSelectOptions,
  scoreEditorSelectTriggerClassName,
  visibleScoreEditorRowsForRecordScore,
  type ScoreEditorRow,
  type ScoreEditorSide,
} from "@/pages/tournaments/schedule/utils/matchScheduleScore";
import {
  avatarToneClass,
  initialsFromName,
} from "@/pages/tournaments/schedule/utils/avatarUtils";
import type { AllowedPlayMode } from "../types";
import { asSelectValue } from "../helpers";

type ScoreGridProps = {
  rows: ScoreEditorRow[];
  playMode: AllowedPlayMode;
  playerOneRowLabel: string;
  playerTwoRowLabel: string;
  playerOneAvatarUrl?: string | null;
  playerTwoAvatarUrl?: string | null;
  /** Stable id for avatar placeholder gradients (e.g. selected match option id). */
  avatarToneSeedPrefix: string;
  isConfirmLocked: boolean;
  openScorePickerKey: string | null;
  setOpenScorePickerKey: (key: string | null) => void;
  onScoreChange: (
    rowId: string,
    side: ScoreEditorSide,
    setIndex: number,
    value: string,
  ) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

export function ScoreGrid({
  rows,
  playMode,
  playerOneRowLabel,
  playerTwoRowLabel,
  playerOneAvatarUrl = null,
  playerTwoAvatarUrl = null,
  avatarToneSeedPrefix,
  isConfirmLocked,
  openScorePickerKey,
  setOpenScorePickerKey,
  onScoreChange,
  t,
}: ScoreGridProps) {
  const visibleRows = useMemo(
    () => visibleScoreEditorRowsForRecordScore(rows, playMode),
    [rows, playMode],
  );
  const columnCount = Math.max(visibleRows.length, 1);
  /** One visible set: keep score on the same row as name on narrow screens (no S-row stack). */
  const isSingleSet = columnCount === 1;
  /** Fixed-width columns (32px): matches read-only match cards; scrolls on very narrow viewports. */
  const scoreGridStyle = useMemo(
    () =>
      ({
        "--score-column-count": columnCount,
        gridTemplateColumns: `repeat(${columnCount}, 2rem)`,
      }) as CSSProperties,
    [columnCount],
  );
  const playerRows = useMemo(
    () =>
      [
        {
          side: "playerOne" as const,
          label: playerOneRowLabel,
          avatarUrl: playerOneAvatarUrl,
        },
        {
          side: "playerTwo" as const,
          label: playerTwoRowLabel,
          avatarUrl: playerTwoAvatarUrl,
        },
      ] as const,
    [playerOneAvatarUrl, playerOneRowLabel, playerTwoAvatarUrl, playerTwoRowLabel],
  );

  return (
    <div className="min-w-0 w-full overflow-hidden rounded-[12px] border border-[#010a04]/[0.08] bg-[#f7f8f7]">
      <div className="flex w-full min-w-0 flex-col">
        <div className="hidden items-end justify-between gap-x-3 gap-y-2 border-b border-[#010a04]/[0.06] px-3 py-2.5 sm:flex">
          <div className="flex min-w-0 shrink-0 items-end gap-2.5">
            <span className="h-7 w-7 shrink-0" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#010a04]/45">
              {t("recordScorePage.enter.sideLabel")}
            </span>
          </div>
          <div className="max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <div className="ml-auto inline-grid min-w-0 gap-1" style={scoreGridStyle}>
              {visibleRows.map((_, setIndex) => (
                <span
                  key={`set-label-${setIndex}`}
                  className="min-w-0 text-center text-[9px] font-semibold uppercase tracking-[0.05em] text-[#010a04]/45"
                >
                  S{setIndex + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
        {playerRows.map(({ side, label, avatarUrl }) => (
          <div
            key={side}
            className={cn(
              "border-b border-[#010a04]/[0.06] px-3 py-2.5 last:border-b-0",
              isSingleSet
                ? "flex flex-row items-center justify-between gap-x-3 gap-y-2"
                : "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-2",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 items-center gap-2.5",
                isSingleSet ? "min-w-0 flex-1" : "w-full sm:w-auto sm:min-w-[80px] sm:flex-1",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-[#010a04]/70",
                  avatarToneClass(`${avatarToneSeedPrefix}-${side}`),
                )}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  initialsFromName(label)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="min-w-0 truncate text-[13px] font-semibold leading-snug text-[#010a04] sm:text-[14px]"
                  title={label}
                >
                  {label}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex min-w-0 max-w-full",
                isSingleSet
                  ? "shrink-0 flex-row items-center justify-end sm:flex-1"
                  : "w-full flex-col items-stretch sm:items-end sm:justify-end sm:flex-1",
              )}
            >
              {!isSingleSet && side === "playerOne" ? (
                <div className="mb-1 max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] sm:hidden">
                  <div
                    className="mx-auto inline-grid min-w-0 gap-1"
                    style={scoreGridStyle}
                  >
                    {visibleRows.map((_, setIndex) => (
                      <span
                        key={`set-label-mobile-${setIndex}`}
                        className="min-w-0 text-center text-[9px] font-semibold uppercase tracking-[0.05em] text-[#010a04]/45"
                      >
                        S{setIndex + 1}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div
                className={cn(
                  "max-w-full min-w-0",
                  isSingleSet
                    ? ""
                    : "overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]",
                )}
              >
                <div
                  className={cn(
                    "inline-grid min-w-0 gap-1",
                    isSingleSet ? "ml-auto sm:ml-auto sm:mr-0" : "mx-auto sm:ml-auto sm:mr-0",
                  )}
                  style={scoreGridStyle}
                >
                {visibleRows.map((row, setIndex) => {
                  const value = asSelectValue(
                    side === "playerOne" ? row.playerOne : row.playerTwo,
                  );
                  const options = getScoreSelectOptions(
                    row,
                    side,
                    playMode,
                    setIndex,
                  );
                  const pickerKey = `${row.id}-${side}-${setIndex}`;

                  return (
                    <Select
                      key={pickerKey}
                      value={value}
                      open={
                        isConfirmLocked ? false : openScorePickerKey === pickerKey
                      }
                      onOpenChange={(nextOpen) => {
                        if (isConfirmLocked) return;
                        setOpenScorePickerKey(nextOpen ? pickerKey : null);
                      }}
                      onValueChange={(nextValue) =>
                        onScoreChange(row.id, side, setIndex, nextValue)
                      }
                    >
                      <SelectTrigger
                        hideIcon
                        disabled={isConfirmLocked}
                        aria-label={t("tournaments.scoreInputLabel", {
                          playerName: label,
                          setNumber: setIndex + 1,
                        })}
                        className={cn(
                          scoreEditorSelectTriggerClassName(
                            row,
                            setIndex,
                            playMode,
                            side === "playerOne" ? "one" : "two",
                          ),
                          "data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground",
                        )}
                      >
                        <SelectValue placeholder="–" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        align="center"
                        sideOffset={6}
                        collisionPadding={12}
                        showScrollButtons={false}
                        className="max-h-64"
                      >
                        {options.map((opt) => (
                          <SelectItem
                            key={`${row.id}-${side}-${setIndex}-${opt.value}`}
                            value={opt.value}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
