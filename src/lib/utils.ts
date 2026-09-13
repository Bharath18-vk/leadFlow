import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "No phone";
  const cleaned = phone.replace(/[^\d+]/g, "");
  // If Indian 10 digits
  if (/^\d{10}$/.test(cleaned)) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  // If 91 followed by 10 digits
  if (/^91\d{10}$/.test(cleaned)) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  // If +91 followed by 10 digits
  if (/^\+91\d{10}$/.test(cleaned)) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
