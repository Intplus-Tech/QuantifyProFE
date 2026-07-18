const NAIRA = "₦";

export function formatNaira(value: number, decimals = 2): string {
  return (
    NAIRA +
    new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  );
}

/** Bare number, no currency symbol — used inside table amount columns. */
export function formatAmount(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatQty(value: number | null): string {
  if (value === null) return "—";
  const decimals = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatRate(value: number | null): string {
  if (value === null) return "—";
  const decimals = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export { NAIRA };
