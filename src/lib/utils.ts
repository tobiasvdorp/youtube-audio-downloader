import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;

export function isValidYoutubeUrl(url: string): boolean {
  return YOUTUBE_URL_REGEX.test(url);
}

export function base64ToBlob(base64: string, contentType: string): Blob {
  const binaryString = atob(base64);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: contentType });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
