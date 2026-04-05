import type { TFunction } from "i18next";
import { Switch } from "@/components/ui/switch";

interface ResultsHeaderProps {
  myScoreOnly: boolean;
  onMyScoreOnlyChange: (checked: boolean) => void;
  t: TFunction;
}

export function ResultsHeader({ myScoreOnly, onMyScoreOnlyChange, t }: ResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl font-semibold text-[#111827]">{t("tournaments.allResults")}</h2>
      <div className="inline-flex items-center gap-2 text-sm font-medium text-[#374151]">
        <span>{t("settings.nav.myScore")}</span>
        <Switch
          checked={myScoreOnly}
          onCheckedChange={onMyScoreOnlyChange}
          aria-label={t("settings.nav.myScore")}
        />
      </div>
    </div>
  );
}
