type QrPreviewProps = {
  dataUrl: string | null;
  onOpenLarge: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

export function QrPreview({ dataUrl, onOpenLarge, t }: QrPreviewProps) {
  if (dataUrl) {
    return (
      <button
        type="button"
        onClick={onOpenLarge}
        className="group rounded-[10px] border border-[#010a04]/12 bg-white p-2 shadow-[inset_0_0_0_1px_rgba(1,10,4,0.04)] transition hover:border-[#067429]/35 sm:rounded-[4px] sm:p-[6px]"
        title={t("recordScorePage.enter.qrPreviewTapToEnlarge")}
      >
        <img
          src={dataUrl}
          alt={t("recordScorePage.enter.qrPreviewAlt")}
          className="mx-auto h-[136px] w-[136px] object-contain sm:h-[118px] sm:w-[118px]"
        />
        <p className="mt-1.5 text-center text-[11px] leading-snug text-[#010a04]/55 group-hover:text-[#067429] sm:mt-1">
          {t("recordScorePage.enter.qrPreviewTapToEnlarge")}
        </p>
      </button>
    );
  }

  return null;
}
