"use client";

import { useEffect, useState } from "react";
import { DEFAULT_CURRENCY, type DisplayCurrency } from "@/lib/currency";

const CURRENCY_STORAGE_KEY = "paylens.displayCurrency";

function isDisplayCurrency(value: string | null): value is DisplayCurrency {
  return value === "USD" || value === "MXN";
}

export function useCurrency() {
  const [currency, setCurrency] = useState<DisplayCurrency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (isDisplayCurrency(stored)) {
      setCurrency(stored);
    }
  }, []);

  const updateCurrency = (nextCurrency: DisplayCurrency) => {
    setCurrency(nextCurrency);
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);
  };

  return { currency, setCurrency: updateCurrency };
}
