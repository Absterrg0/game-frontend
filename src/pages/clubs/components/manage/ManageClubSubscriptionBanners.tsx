import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { getDateFnsLocale } from "@/lib/dateFnsLocale";
import type { ClubSubscription } from "@/pages/clubs/hooks/useClubStaff";
import { isSubscriptionExpiredByLocalDay } from "@/utils/date";

interface ManageClubSubscriptionBannersProps {
  showSubscriptionBanner: boolean;
  showUpgradeBanner: boolean;
  subscription: ClubSubscription | undefined;
  onRenew: () => void;
  onUpgrade: () => void;
}

export function ManageClubSubscriptionBanners({
  showSubscriptionBanner,
  showUpgradeBanner,
  subscription,
  onRenew,
  onUpgrade,
}: ManageClubSubscriptionBannersProps) {
  const { t, i18n } = useTranslation();

  let subscriptionBannerCopy: {
    key: "manageClub.subscriptionBannerUnknownExpiry" | "manageClub.subscriptionBannerExpiredOn" | "manageClub.subscriptionBannerExpiresOn",
    date: string | undefined
  };

  const expiresAt = subscription?.expiresAt ?? null;
  if (!expiresAt) {
    subscriptionBannerCopy = {
      key: "manageClub.subscriptionBannerUnknownExpiry",
      date: undefined,
    };
  } else {
    const locale = getDateFnsLocale(i18n.language);
    const date = format(expiresAt, "PPP", { locale });
    if (isSubscriptionExpiredByLocalDay(expiresAt)) {
      subscriptionBannerCopy = {
        key: "manageClub.subscriptionBannerExpiredOn",
        date,
      };
    } else {
      subscriptionBannerCopy = {
        key: "manageClub.subscriptionBannerExpiresOn",
        date,
      };
    }
  }

  return (
    <>
      {showSubscriptionBanner && (
        <div className="mt-5 flex flex-col gap-3 rounded-[12px] border border-black/10 bg-[rgba(244,201,93,0.13)] px-[15px] py-[15px] sm:flex-row sm:items-center sm:justify-between sm:gap-[25px]">
          <div className="min-w-0 flex flex-1 items-start gap-[14px] text-[#906500]">
            <HugeiconsIcon icon={InformationCircleIcon} size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] font-medium">{t("manageClub.subscriptionBannerTitle")}</p>
              <p className="mt-2 text-[13px] leading-[1.25]">
                {subscriptionBannerCopy.date === undefined
                  ? t(subscriptionBannerCopy.key)
                  : t(subscriptionBannerCopy.key, { date: subscriptionBannerCopy.date })}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-[30px] w-full shrink-0 self-start rounded-[8px] bg-[#010a04] px-[18px] text-[14px] text-white hover:bg-[#010a04]/90 sm:w-auto sm:self-center"
            onClick={onRenew}
          >
            {t("manageClub.renewNow")}
          </Button>
        </div>
      )}

      {showUpgradeBanner && (
        <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-[12px] border border-brand-primary/30 bg-brand-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <HugeiconsIcon icon={SparklesIcon} size={20} className="shrink-0 text-brand-primary" />
            <p className="text-sm text-muted-foreground">{t("manageClub.upgradeBannerBenefits")}</p>
          </div>
          <Button
            size="sm"
            className="h-[30px] w-full shrink-0 rounded-[8px] bg-brand-primary text-[14px] hover:bg-brand-primary-hover sm:w-auto"
            onClick={onUpgrade}
          >
            {t("manageClub.upgradeToPremium")}
          </Button>
        </div>
      )}
    </>
  );
}
