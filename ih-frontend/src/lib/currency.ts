// src/lib/currency.ts

// Example currency rates (should be replaced with real API in production)
const rates: Record<string, number> = {
  USD: 1,
  EUR: 0.93,
  INR: 83.2,
  GBP: 0.81,
  AED: 3.67,
  JPY: 151.5,
};

const symbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  GBP: '£',
  AED: 'د.إ',
  JPY: '¥',
};

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (!rates[fromCurrency] || !rates[toCurrency]) return amount;
  return (amount / rates[fromCurrency]) * rates[toCurrency];
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: string): string {
  return symbols[currency] || currency;
}
