import type { TFunction } from "i18next";
import type { DerivedMatch } from "./types";
import { MatchCard } from "./MatchCard";

interface MatchesListProps {
  matches: DerivedMatch[];
  filteredMatches: DerivedMatch[];
  onlyMyMatches: boolean;
  onToggleOnlyMine: () => void;
  t: TFunction;
}

export function MatchesList({
  matches,
  filteredMatches,
  onlyMyMatches,
  onToggleOnlyMine,
  t,
}: MatchesListProps) {
  const emptyText = matches.length === 0 ? t("tournaments.noMatchesAvailable") : t("tournaments.noMyMatchesAvailable");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold leading-tight text-[#111827]">{t("tournaments.allMatches")}</h3>
        <button
          type="button"
          aria-pressed={onlyMyMatches}
          onClick={onToggleOnlyMine}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#374151]"
        >
          <span>{t("tournaments.myMatches")}</span>
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              onlyMyMatches ? "bg-[#16a34a]" : "bg-[#d1d5db]"
            }`}
          >
            <span
              className={`inline-block size-5 transform rounded-full bg-white transition ${
                onlyMyMatches ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d1d5db] bg-white p-8 text-sm text-[#6b7280]">{emptyText}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
