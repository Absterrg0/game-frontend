import type { ComponentType } from "react";

type IconComponent = ComponentType<{
  size?: number | string;
  className?: string;
  "aria-hidden"?: boolean;
}>;

interface InfoItemProps {
  icon: IconComponent;
  label: string;
  value: string;
  valueClassName?: string;
}

export function InfoItem({ icon: Icon, label, value, valueClassName }: InfoItemProps) {
  return (
    <div className="flex items-start gap-4 sm:gap-6">
      <Icon size={24} aria-hidden className="mt-[1px] text-[#010a04]" />
      <div>
        <p className={`text-[16px] font-medium leading-5 text-[#010a04] ${valueClassName ?? ""}`.trim()}>{value}</p>
        <p className="text-[14px] leading-5 text-[#010a04]/60">{label}</p>
      </div>
    </div>
  );
}
