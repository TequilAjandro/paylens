export type DisplayCurrency = "USD" | "MXN";

export const DEFAULT_CURRENCY: DisplayCurrency = "USD";
export const USD_TO_MXN_RATE = 17;

function getLocale(currency: DisplayCurrency): string {
  return currency === "MXN" ? "es-MX" : "en-US";
}

export function currencyPrefix(currency: DisplayCurrency): string {
  return currency === "MXN" ? "MX$" : "$";
}

export function convertFromUsd(amountUsd: number, currency: DisplayCurrency): number {
  return currency === "MXN" ? amountUsd * USD_TO_MXN_RATE : amountUsd;
}

export function formatCurrencyFromUsd(amountUsd: number, currency: DisplayCurrency): string {
  return new Intl.NumberFormat(getLocale(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(convertFromUsd(amountUsd, currency));
}

export function yearCurrencyLabel(currency: DisplayCurrency): string {
  return `${currency} / year`;
}
