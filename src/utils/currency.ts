/**
 * Entry fees are always stored and shown in euros, independent of UI language.
 */
export function formatEntryFeeEuro(amount: number, locale?: string): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  const hasFraction = Math.abs(amount % 1) > Number.EPSILON;
  const fractionDigits = hasFraction ? 2 : 0;

  return new Intl.NumberFormat(locale || undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
