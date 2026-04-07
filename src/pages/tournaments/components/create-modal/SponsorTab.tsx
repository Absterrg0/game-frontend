import { useTranslation } from "react-i18next";
import type { ClubSponsor } from "@/pages/sponsors/hooks";
import type { CreateTournamentInput } from "@/models/tournament/types";
import {
  RadioGroup,
  RadioGroupCardItem,
} from "@/components/ui/radio-group";
import InlineLoader from "@/components/shared/InlineLoader";

interface SponsorTabProps {
  form: CreateTournamentInput;
  sponsors: ClubSponsor[];
  update: (updates: Partial<CreateTournamentInput>) => void;
  loading?: boolean;
}

const NO_SPONSOR_VALUE = "";

function SponsorCard({
  value,
  title,
  subtitle,
  logoUrl,
  hideAvatar = false,
}: {
  value: string;
  title: string;
  subtitle?: string;
  logoUrl?: string | null;
  hideAvatar?: boolean;
}) {
  return (
    <RadioGroupCardItem
      value={value}
      className={`flex w-full min-w-0 max-w-full items-center justify-between overflow-x-clip rounded-[12px] border px-[13px] py-3 text-left transition-colors data-[state=checked]:border-[1.5px] data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary/[0.05] data-[state=unchecked]:border-[#e1e3e8] data-[state=unchecked]:bg-[#f9fafc] data-[state=unchecked]:hover:bg-[#f4f7fb]`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {!hideAvatar ? (
          logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-[8px] object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-[8px] bg-[#d9d9d9]" />
          )
        ) : null}
        <div>
          <p className="min-w-0 break-words text-[16px] font-medium leading-[1.2] text-[#010a04] [overflow-wrap:anywhere]">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-[5px] min-w-0 break-words text-[14px] leading-tight text-[#010a04]/70 [overflow-wrap:anywhere]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black/15 transition-colors group-data-[state=checked]:border-brand-primary`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full bg-transparent transition-colors group-data-[state=checked]:bg-brand-primary`}
        />
      </span>
    </RadioGroupCardItem>
  );
}

export function SponsorTab({ form, sponsors, update, loading = false }: SponsorTabProps) {
  const { t } = useTranslation();
  const activeSponsors = sponsors.filter((s) => s.status === "active");

  return (
    <div className="min-w-0 max-w-full space-y-[14px] overflow-x-clip">
      <h3 className="break-words text-[18px] font-medium leading-[1.3] text-[#010a04] [overflow-wrap:anywhere]">
        {t("tournaments.selectSponsor")}
      </h3>
      <p className="max-w-full break-words text-[14px] leading-[1.4] text-[#010a04]/60 [overflow-wrap:anywhere] sm:max-w-[540px]">
        {t("tournaments.selectSponsorHint")}
      </p>

      {!form.club ? (
        <div
          className="break-words rounded-[12px] border border-black/12 bg-black/[0.04] px-[13px] py-3 text-[14px] font-semibold leading-snug text-[#010a04] [overflow-wrap:anywhere]"
          role="status"
        >
          {t("tournaments.selectClubFirst")}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <InlineLoader />
        </div>
      ) : (
        <RadioGroup
          className="gap-2"
          value={form.sponsor ?? NO_SPONSOR_VALUE}
          onValueChange={(v) =>
            update({ sponsor: v === NO_SPONSOR_VALUE ? null : v })
          }
        >
          <SponsorCard
            value={NO_SPONSOR_VALUE}
            title={t("tournaments.noSponsor")}
            hideAvatar
          />

          {activeSponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              value={sponsor.id}
              title={sponsor.name}
              subtitle={
                sponsor.description?.trim() || t("tournaments.officialSponsor")
              }
              logoUrl={sponsor.logoUrl}
            />
          ))}
        </RadioGroup>
      )}
    </div>
  );
}
