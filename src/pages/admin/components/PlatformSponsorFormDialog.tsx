import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SponsorLogoUploadZone } from "@/components/shared/SponsorLogoUploadZone";
import { toast } from "sonner";
import {
  DialogClose,
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type {
  PlatformSponsor,
  UpsertPlatformSponsorInput,
} from "@/pages/admin/hooks";

interface SponsorFormState {
  name: string;
  link: string;
  logoUrl: string;
}

const EMPTY_FORM: SponsorFormState = {
  name: "",
  link: "",
  logoUrl: "",
};

export interface PlatformSponsorFormDialogProps {
  open: boolean;
  editingSponsor: PlatformSponsor | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: UpsertPlatformSponsorInput) => Promise<void>;
}

export function PlatformSponsorFormDialog({
  open,
  editingSponsor,
  isSaving,
  onOpenChange,
  onSave,
}: PlatformSponsorFormDialogProps) {
  const [form, setForm] = useState<SponsorFormState>(EMPTY_FORM);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      return;
    }

    if (editingSponsor) {
      setForm({
        name: editingSponsor.name,
        link: editingSponsor.link ?? "",
        logoUrl: editingSponsor.logoUrl ?? "",
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [open, editingSponsor]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: UpsertPlatformSponsorInput = {
      name: form.name.trim(),
      link: form.link.trim() || null,
      logoUrl: form.logoUrl.trim() || null,
    };

    if (!payload.name) {
      toast.error("Name is required");
      return;
    }

    await onSave(payload);
  };

  const submitLabel = editingSponsor ? "Save Sponsor" : "Create Sponsor";
  const title = editingSponsor ? "Edit Sponsor" : "Add New Sponsor";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[416px] gap-0 overflow-visible rounded-[12px] border-black/10 px-[15px] py-5 shadow-[0px_3px_15px_0px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[21px] font-semibold leading-none text-[#010a04]">{title}</h2>
          <DialogClose asChild>
            <button
              type="button"
              className="inline-flex size-6 items-center justify-center rounded-md text-[#010a04]"
              aria-label="Close"
            >
              <X className="size-[18px]" />
            </button>
          </DialogClose>
        </div>

        <div className="mt-[18px] mb-[22px] h-px w-full bg-black/10" />

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
          <div className="space-y-2.5">
            <SponsorLogoUploadZone
              logoUrl={form.logoUrl}
              onLogoUrlChange={(nextUrl) => setForm((prev) => ({ ...prev, logoUrl: nextUrl }))}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-[10px]">
            <Label
              htmlFor="admin-platform-sponsor-name"
              className="text-xs font-medium uppercase tracking-normal text-[#010a04]/70"
            >
              Sponsor Name
            </Label>
            <Input
              id="admin-platform-sponsor-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Enter sponsor name"
              disabled={isSaving}
              className="h-[38px] rounded-[8px] border-[#e1e3e8] bg-[#f9fafc] text-sm text-[#010a04] placeholder:text-[#010a04]/50"
            />
          </div>

          <div className="space-y-[10px]">
            <Label
              htmlFor="admin-platform-sponsor-url"
              className="text-xs font-medium uppercase tracking-normal text-[#010a04]/70"
            >
              Sponsor URL
            </Label>
            <Input
              id="admin-platform-sponsor-url"
              type="url"
              value={form.link}
              onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
              placeholder="www.example.com"
              disabled={isSaving}
              className="h-[38px] rounded-[8px] border-[#e1e3e8] bg-[#f9fafc] text-sm text-[#010a04] placeholder:text-[#010a04]/50"
            />
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-[38px] w-full rounded-[8px] bg-linear-to-r from-[#0a6925] via-[#0c7b2c] to-[#0f8d33] text-base font-medium text-white hover:opacity-95"
          >
            {isSaving ? "Saving..." : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}