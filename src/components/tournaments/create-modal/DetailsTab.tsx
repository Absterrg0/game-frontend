import { useTranslation } from "react-i18next";
import type { CreateTournamentInput } from "@/hooks/tournament";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLAY_MODES = [
  { value: "TieBreak10", label: "TieBreak 10" },
  { value: "1set", label: "1 Set Match" },
  { value: "3setTieBreak10", label: "3 Set TieBreak 10" },
  { value: "3set", label: "3 Set" },
  { value: "5set", label: "5 Set" },
] as const;

const DURATION_OPTIONS = ["15 Min", "30 Min", "45 Min", "60 Min", "90 Min"];
const BREAK_OPTIONS = ["0 Minutes", "5 Minutes", "10 Minutes", "15 Minutes"];

interface DetailsTabProps {
  form: CreateTournamentInput;
  update: (updates: Partial<CreateTournamentInput>) => void;
}

export function DetailsTab({ form, update }: DetailsTabProps) {
  const { t } = useTranslation();

  return (
    <TabsContent value="details" className="mt-0">
      <div className="space-y-4">
        <div>
          <Label className="text-[14px] font-medium text-[#111827]">
            {t("tournaments.gameMode")} *
          </Label>
          <Select value={form.playMode} onValueChange={(v) => update({ playMode: v })}>
            <SelectTrigger className="mt-1 h-10 w-full rounded-lg border-[#e5e7eb] text-[14px] font-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAY_MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[14px] font-medium text-[#111827]">
            {t("tournaments.entryFee")}
          </Label>
          <div className="mt-1 flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3">
            <span className="text-[14px] text-[#9ca3af]">$</span>
            <Input
              type="number"
              min={0}
              placeholder="00"
              value={form.externalFee ?? ""}
              onChange={(e) => update({ externalFee: e.target.value ? Number(e.target.value) : 0 })}
              className="h-auto border-0 p-0 text-[14px] shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[14px] font-medium text-[#111827]">
              {t("tournaments.matchDuration")}
            </Label>
            <Select value={form.playTime ?? "30 Min"} onValueChange={(v) => update({ playTime: v })}>
              <SelectTrigger className="mt-1 h-10 w-full rounded-lg border-[#e5e7eb] text-[14px] font-normal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[14px] font-medium text-[#111827]">
              {t("tournaments.breakTime")}
            </Label>
            <Select value={form.pauseTime ?? "5 Minutes"} onValueChange={(v) => update({ pauseTime: v })}>
              <SelectTrigger className="mt-1 h-10 w-full rounded-lg border-[#e5e7eb] text-[14px] font-normal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BREAK_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[14px] font-medium text-[#111827]">
              {t("tournaments.minPlayers")}
            </Label>
            <Input
              type="number"
              min={1}
              value={form.minMember ?? ""}
              onChange={(e) => update({ minMember: e.target.value ? Number(e.target.value) : 1 })}
              className="mt-1 h-10 rounded-lg border-[#e5e7eb] text-[14px]"
            />
          </div>

          <div>
            <Label className="text-[14px] font-medium text-[#111827]">
              {t("tournaments.maxPlayers")}
            </Label>
            <Input
              type="number"
              min={1}
              value={form.maxMember ?? ""}
              onChange={(e) => update({ maxMember: e.target.value ? Number(e.target.value) : 1 })}
              className="mt-1 h-10 rounded-lg border-[#e5e7eb] text-[14px]"
            />
          </div>
        </div>

        <div>
          <Label className="text-[14px] font-medium text-[#111827]">
            {t("tournaments.foodDrinks")}
          </Label>
          <textarea
            placeholder={t("tournaments.foodDrinksPlaceholder")}
            value={form.foodInfo ?? ""}
            onChange={(e) => update({ foodInfo: e.target.value })}
            className="mt-1 min-h-[106px] w-full rounded-lg border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 text-[14px] placeholder:text-[#9ca3af]"
          />
        </div>
      </div>
    </TabsContent>
  );
}
