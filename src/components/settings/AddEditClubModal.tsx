import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateClub,
  useUpdateClub,
  useClubById,
  type CourtInput,
  type CourtType,
  type CourtPlacement,
} from "@/hooks/club";
import { toast } from "sonner";

const COURT_TYPES: CourtType[] = [
  "concrete",
  "clay",
  "hard",
  "grass",
  "carpet",
  "other",
];
const COURT_PLACEMENTS: CourtPlacement[] = ["indoor", "outdoor"];

interface AddEditClubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClubId: string | null;
}

const emptyCourt = (): CourtInput => ({
  name: "",
  type: "concrete",
  placement: "outdoor",
});

export function AddEditClubModal({
  open,
  onOpenChange,
  editClubId,
}: AddEditClubModalProps) {
  const { t } = useTranslation();
  const isEdit = !!editClubId;

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [bookingSystemUrl, setBookingSystemUrl] = useState("");
  const [address, setAddress] = useState("");
  const [courts, setCourts] = useState<CourtInput[]>([emptyCourt()]);

  const { data: clubData, isLoading: loadingClub } = useClubById(editClubId);
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();

  const isPending = createClub.isPending || updateClub.isPending;

  useEffect(() => {
    if (open && isEdit && clubData) {
      setName(clubData.club.name);
      setWebsite(clubData.club.website ?? "");
      setBookingSystemUrl(clubData.club.bookingSystemUrl ?? "");
      setAddress(clubData.club.address);
      setCourts(
        clubData.courts.length > 0
          ? clubData.courts.map((c: { id: string; name: string; type: string; placement: string }) => ({
              id: c.id,
              name: c.name,
              type: c.type as CourtType,
              placement: c.placement as CourtPlacement,
            }))
          : [emptyCourt()]
      );
    } else if (open && !isEdit) {
      setName("");
      setWebsite("");
      setBookingSystemUrl("");
      setAddress("");
      setCourts([emptyCourt()]);
    }
  }, [open, isEdit, clubData]);

  const handleAddCourt = useCallback(() => {
    setCourts((prev) => [...prev, emptyCourt()]);
  }, []);

  const handleRemoveCourt = useCallback((index: number) => {
    setCourts((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [emptyCourt()] : next;
    });
  }, []);

  const handleCourtChange = useCallback(
    (index: number, field: keyof CourtInput, value: string) => {
      setCourts((prev) =>
        prev.map((c, i) =>
          i === index ? { ...c, [field]: value } : c
        )
      );
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        toast.error(t("settings.adminClubsClubNamePlaceholder"));
        return;
      }
      if (!address.trim()) {
        toast.error(t("settings.adminClubsAddressPlaceholder"));
        return;
      }

      const courtsPayload = courts
        .filter((c) => c.name.trim())
        .map((c) => ({
          id: c.id,
          name: c.name.trim(),
          type: c.type,
          placement: c.placement,
        }));

      try {
        if (isEdit && editClubId) {
          await updateClub.mutateAsync({
            clubId: editClubId,
            data: {
              name: name.trim(),
              website: website.trim() || null,
              bookingSystemUrl: bookingSystemUrl.trim() || null,
              address: address.trim(),
              courts: courtsPayload.length > 0 ? courtsPayload : [],
            },
          });
          toast.success(t("settings.adminClubsUpdateSuccess"));
        } else {
          await createClub.mutateAsync({
            name: name.trim(),
            website: website.trim() || null,
            bookingSystemUrl: bookingSystemUrl.trim() || null,
            address: address.trim(),
            courts: courtsPayload,
          });
          toast.success(t("settings.adminClubsCreateSuccess"));
        }
        onOpenChange(false);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(
          axiosErr?.response?.data?.message ??
            (isEdit
              ? t("settings.adminClubsUpdateError")
              : t("settings.adminClubsCreateError"))
        );
      }
    },
    [
      name,
      address,
      website,
      bookingSystemUrl,
      courts,
      isEdit,
      editClubId,
      createClub,
      updateClub,
      onOpenChange,
      t,
    ]
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        showCloseButton={true}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("settings.adminClubsModalTitle")}</DialogTitle>
        </DialogHeader>

        {isEdit && loadingClub ? (
          <div className="flex items-center justify-center py-8">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                {t("settings.adminClubsClubName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder={t("settings.adminClubsClubNamePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                {t("settings.adminClubsWebsite")} <span className="text-muted-foreground/70">(optional)</span>
              </Label>
              <Input
                placeholder={t("settings.adminClubsWebsitePlaceholder")}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                {t("settings.adminClubsBookingUrl")} <span className="text-muted-foreground/70">(optional)</span>
              </Label>
              <Input
                placeholder={t("settings.adminClubsBookingUrlPlaceholder")}
                value={bookingSystemUrl}
                onChange={(e) => setBookingSystemUrl(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                {t("settings.adminClubsAddress")} <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder={t("settings.adminClubsAddressPlaceholder")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-medium uppercase text-muted-foreground">
                {t("settings.adminClubsAllCourts")} <span className="text-muted-foreground/70">(optional)</span>
              </Label>
              <div className="rounded-lg border border-[#e5e7eb] overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 p-2 bg-[#f9fafb] text-xs font-medium uppercase text-muted-foreground">
                  <span>{t("settings.adminClubsCourtName")}</span>
                  <span className="w-24">{t("settings.adminClubsCourtType")}</span>
                  <span className="w-24">
                    {t("settings.adminClubsCourtPlacement")}
                  </span>
                  <span className="w-8" />
                </div>
                {courts.map((court, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-2 p-2 items-center border-t border-[#e5e7eb]"
                  >
                    <Input
                      placeholder={t("settings.adminClubsCourtName")}
                      value={court.name}
                      onChange={(e) =>
                        handleCourtChange(index, "name", e.target.value)
                      }
                      className="h-9 text-sm"
                    />
                    <Select
                      value={court.type}
                      onValueChange={(v) =>
                        handleCourtChange(index, "type", v)
                      }
                    >
                      <SelectTrigger className="h-9 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COURT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(
                              `settings.adminClubsCourtType${type.charAt(0).toUpperCase()}${type.slice(1)}`
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={court.placement}
                      onValueChange={(v) =>
                        handleCourtChange(index, "placement", v)
                      }
                    >
                      <SelectTrigger className="h-9 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COURT_PLACEMENTS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {t(
                              `settings.adminClubsCourtPlacement${p.charAt(0).toUpperCase()}${p.slice(1)}`
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveCourt(index)}
                      aria-label={t("settings.adminClubsDeleteCourtAria")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCourt}
                className="w-full"
              >
                {t("settings.adminClubsAddCourt")}
              </Button>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {t("settings.adminClubsCancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
              >
                {isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  t("settings.adminClubsSave")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
