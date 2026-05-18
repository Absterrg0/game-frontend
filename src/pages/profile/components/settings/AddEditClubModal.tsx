import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Delete01Icon, Upload01Icon, XIcon } from "@/icons/figma-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LocationSearchInput } from "./LocationSearchInput";
import InlineLoader from "@/components/shared/InlineLoader";
import { useAddEditClubForm } from "./add-edit-club-modal/useAddEditClubForm";
import { ClubCourtsEditor } from "./add-edit-club-modal/ClubCourtsEditor";
import { toast } from "sonner";

const MAX_CLUB_LOGO_SIZE_MB = 2;
const ACCEPTED_LOGO_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const ACCEPTED_LOGO_MIME_SET = new Set(ACCEPTED_LOGO_MIME_TYPES);

interface AddEditClubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClubId: string | null;
}

export function AddEditClubModal({
  open,
  onOpenChange,
  editClubId,
}: AddEditClubModalProps) {
  const { t } = useTranslation();
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const {
    isEdit,
    loadingClub,
    isPending,
    currentForm,
    setField,
    handleAddCourt,
    handleRemoveCourt,
    handleCourtChange,
    handleLocationSelect,
    handleAddressChange,
    handleSubmit,
    handleDialogOpenChange,
    updateClub,
    close,
    courtTypes,
    courtPlacements,
  } = useAddEditClubForm({ editClubId, onOpenChange });

  const handleLogoFileSelection = async (file: File | null) => {
    if (!file || isProcessingLogo || isPending) return;
    if (!ACCEPTED_LOGO_MIME_SET.has(file.type)) {
      toast.error(t("settings.adminClubsLogoInvalidFileType"));
      return;
    }
    if (file.size > MAX_CLUB_LOGO_SIZE_MB * 1024 * 1024) {
      toast.error(t("sponsors.logoUpload.fileTooLarge", { maxMb: MAX_CLUB_LOGO_SIZE_MB }));
      return;
    }
    setIsProcessingLogo(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error(t("settings.adminClubsLogoUploadError")));
        reader.readAsDataURL(file);
      });
      const previousLogo = currentForm.logoUrl;
      setField("logoUrl", base64);
      if (isEdit && editClubId) {
        try {
          await updateClub.mutateAsync({ clubId: editClubId, data: { logoUrl: base64 } });
        } catch (error) {
          setField("logoUrl", previousLogo);
          throw error;
        }
      }
      toast.success(t("settings.adminClubsLogoUploadSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("settings.adminClubsLogoUploadError"));
    } finally {
      setIsProcessingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const inputClassName =
    "h-[34px] rounded-[8px] border-[#e1e3e8] bg-[#f9fafc] px-2.5 text-xs shadow-none placeholder:text-[#010a04]/50 focus-visible:ring-0 focus-visible:border-[#d5d8de] sm:h-[38px] sm:px-3 sm:text-sm";
  const labelClassName =
    "text-[10px] font-medium uppercase tracking-wide text-[#010a04]/70 sm:text-xs sm:tracking-normal";

  return (
    <Dialog
      open={open}
      onOpenChange={handleDialogOpenChange}
    >
      <DialogContent
        className="gap-0 rounded-[12px] border-[#010a04]/10 px-3 py-4 shadow-[0px_3px_15px_0px_rgba(0,0,0,0.06)] sm:max-w-[416px] sm:px-[15px] sm:py-5"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="gap-3 sm:gap-[18px]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[17px] font-semibold leading-tight text-[#010a04] sm:text-[21px] sm:leading-normal">
              {t("settings.adminClubsModalTitle")}
            </DialogTitle>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5 rounded-none p-0 text-[#010a04]/80 hover:bg-transparent hover:text-[#010a04] sm:size-6"
                aria-label={t("common.close")}
              >
                <XIcon className="size-4 sm:size-5" />
              </Button>
            </DialogClose>
          </div>
          <div className="h-px w-full bg-[#010a04]/10" />
        </DialogHeader>

        {isEdit && loadingClub ? (
          <div className="flex items-center justify-center py-8">
            <InlineLoader />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 sm:mt-[22px] sm:gap-[22px]">
            <div className="grid gap-2 sm:gap-[10px]">
              <Label htmlFor="club-name" className={labelClassName}>
                {t("settings.adminClubsClubName")}
              </Label>
              <Input
                id="club-name"
                placeholder={t("settings.adminClubsClubNamePlaceholder")}
                value={currentForm.name}
                onChange={(event) => setField("name", event.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <input
                ref={logoInputRef}
                type="file"
                accept={ACCEPTED_LOGO_MIME_TYPES.join(",")}
                className="hidden"
                onChange={(e) => void handleLogoFileSelection(e.target.files?.[0] ?? null)}
                disabled={isPending || isProcessingLogo}
              />
              {/* Logo preview */}
              <div
                onClick={() => !(isPending || isProcessingLogo) && logoInputRef.current?.click()}
                className="flex size-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[8px] border border-[#e1e3e8] bg-[#f9fafc] text-base font-semibold text-[#010a04]/50 transition-colors hover:border-[#067429]/40 hover:bg-[#06742908] sm:size-[64px] sm:text-[20px]"
                title={t("settings.adminClubsLogo")}
              >
                {currentForm.logoUrl ? (
                  <img
                    src={currentForm.logoUrl}
                    alt={t("settings.adminClubsLogo")}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{currentForm.name.charAt(0).toUpperCase() || "?"}</span>
                )}
              </div>

              {/* Label + action buttons */}
              <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
                <p className="text-[10px] font-medium uppercase tracking-normal text-[#010a04]/60 sm:text-[11px]">
                  {t("settings.adminClubsLogo")}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending || isProcessingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="h-7 rounded-[7px] border-[#cfd6dc] bg-white px-2 text-[11px] font-medium text-[#010a04] shadow-none hover:bg-[#f4f6f5] sm:h-[30px] sm:px-2.5 sm:text-[12px]"
                  >
                    {isProcessingLogo ? (
                      <InlineLoader size="sm" />
                    ) : (
                      <Upload01Icon size={12} className="text-[#067429] sm:size-[13px]" />
                    )}
                    <span>
                      {currentForm.logoUrl
                        ? t("settings.profilePictureChange")
                        : t("settings.profilePictureUpload")}
                    </span>
                  </Button>

                  {currentForm.logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending || isProcessingLogo}
                      onClick={async () => {
                        if (isEdit && editClubId) {
                          try {
                            await updateClub.mutateAsync({ clubId: editClubId, data: { logoUrl: null } });
                            setField("logoUrl", "");
                          } catch (error) {
                            toast.error(
                              error instanceof Error ? error.message : t("settings.adminClubsLogoUploadError"),
                            );
                          }
                          return;
                        }
                        setField("logoUrl", "");
                      }}
                      className="h-7 rounded-[7px] border-[#ead1d1] bg-white px-2 text-[11px] font-medium text-[#b42318] shadow-none hover:bg-[#fff5f5] sm:h-[30px] sm:px-2.5 sm:text-[12px]"
                    >
                      <Delete01Icon size={12} className="text-[#b42318] sm:size-[13px]" />
                      <span>{t("settings.profilePictureRemove")}</span>
                    </Button>
                  )}
                </div>
                <p className="text-[10px] leading-normal text-[#010a04]/45 sm:text-[11px]">
                  PNG, JPEG, JPG · Max {MAX_CLUB_LOGO_SIZE_MB} MB
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:gap-[10px]">
              <Label htmlFor="club-website" className={labelClassName}>
                {t("settings.adminClubsWebsite")}
              </Label>
              <Input
                id="club-website"
                placeholder={t("settings.adminClubsWebsitePlaceholder")}
                value={currentForm.website}
                onChange={(event) => setField("website", event.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="grid gap-2 sm:gap-[10px]">
              <Label htmlFor="club-booking-url" className={labelClassName}>
                {t("settings.adminClubsBookingUrl")}
              </Label>
              <Input
                id="club-booking-url"
                placeholder={t("settings.adminClubsBookingUrlPlaceholder")}
                value={currentForm.bookingSystemUrl}
                onChange={(event) => setField("bookingSystemUrl", event.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="grid gap-2 sm:gap-[10px]">
              <Label htmlFor="club-address" className={labelClassName}>
                {t("settings.adminClubsAddress")}
              </Label>
              <LocationSearchInput
                id="club-address"
                value={currentForm.address}
                onChange={handleAddressChange}
                onSelect={handleLocationSelect}
                placeholder={t("settings.adminClubsLocationSearchPlaceholder")}
                searchingLabel={t("settings.adminClubsLocationSearching")}
                className={inputClassName}
              />
            </div>
            <ClubCourtsEditor
              courts={currentForm.courts}
              courtTypes={courtTypes}
              courtPlacements={courtPlacements}
              onAddCourt={handleAddCourt}
              onRemoveCourt={handleRemoveCourt}
              onCourtChange={handleCourtChange}
            />

            <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:justify-start sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={close}
                className="h-[34px] rounded-[8px] border-black/12 bg-white text-sm font-medium text-[#010a04] shadow-none hover:bg-[#f9fafc] sm:h-[38px] sm:text-base"
              >
                {t("settings.adminClubsCancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-[34px] rounded-[8px] bg-linear-to-r from-[#0a6925] via-[#0c7b2c] to-[#0f8d33] text-sm font-medium text-white hover:opacity-95 sm:h-[38px] sm:text-base"
              >
                {isPending ? (
                  <InlineLoader size="sm" />
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
