import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function capitalizaAndRestLower(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function formatBytes(bytes: number, decimals = 2): string {
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const result = (bytes / Math.pow(k, i)).toFixed(decimals);
  return `${result} ${sizes[i]}`;
}
