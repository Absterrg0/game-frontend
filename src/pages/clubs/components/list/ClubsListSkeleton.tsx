import { useTranslation } from "react-i18next";

 export function ClubsListSkeleton() {
  const { t } = useTranslation();

   return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading clubs">
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("common.loading")}</span>
      <div
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-hidden="true"
      >
       {Array.from({ length: 6 }).map((_, index) => (
         <div
           key={index}
           className="animate-skeleton-soft rounded-[14px] border border-border bg-white p-4 shadow-sm"
         >

         </div>
       ))}
      </div>
     </div>
     </div>
   );
 }

