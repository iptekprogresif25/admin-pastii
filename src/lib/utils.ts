import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date object or ISO date string into a local 'YYYY-MM-DDTHH:mm' string
 * suitable for HTML <input type="datetime-local" /> without timezone shift.
 */
export function toLocalDatetimeInputString(dateInput?: string | Date | null): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) {
    const fallback = new Date();
    const tzOffset = fallback.getTimezoneOffset() * 60000;
    return new Date(fallback.getTime() - tzOffset).toISOString().slice(0, 16);
  }
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

/**
 * Formats an amount into Indonesian Rupiah currency format.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
