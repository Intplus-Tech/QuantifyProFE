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

/** Currency symbol for a currency code — falls back to the code itself. */
export function currencySymbol(code?: string): string {
  switch ((code ?? "NGN").toUpperCase()) {
    case "NGN":
      return "₦";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    default:
      return code ?? "₦";
  }
}

/** Money with a leading symbol. `null` → em dash ("not yet priced", never ₦0). */
export function formatMoney(
  value: number | null | undefined,
  currency?: string,
  decimals = 0,
): string {
  if (value === null || value === undefined) return "—";
  return (
    currencySymbol(currency) +
    new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  );
}

/** Bare amount for table cells. `null` → em dash. */
export function formatCell(
  value: number | null | undefined,
  decimals = 0,
): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export { NAIRA };
