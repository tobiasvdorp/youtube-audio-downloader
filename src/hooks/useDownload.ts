"use client";

import { useState } from "react";
import { base64ToBlob, triggerDownload } from "@/lib/utils";
import type { DownloadFormat, DownloadProgress } from "@/types/download";

type UseDownloadReturn = {
  download: (url: string, format: DownloadFormat) => Promise<void>;
  isLoading: boolean;
  progress: DownloadProgress | null;
  error: string | null;
  clearError: () => void;
};

export function useDownload(): UseDownloadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const clearError = () => setError(null);

  const download = async (url: string, format: DownloadFormat) => {
    setIsLoading(true);
    setError(null);
    setProgress({ type: "progress", percent: 0, stage: "downloading" });

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Download failed");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Stream not available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6)) as DownloadProgress;
            setProgress(data);

            if (data.type === "complete" && data.data) {
              const blob = base64ToBlob(
                data.data,
                data.contentType || "audio/mpeg"
              );
              triggerDownload(blob, data.filename || `audio.${format}`);
            }

            if (data.type === "error") {
              throw new Error(data.error || "Download failed");
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      // Reset progress after a short delay
      setTimeout(() => setProgress(null), 1500);
    }
  };

  return {
    download,
    isLoading,
    progress,
    error,
    clearError,
  };
}
