"use client";

import { useState } from "react";
import { base64ToBlob, triggerDownload } from "@/lib/utils";
import type { DownloadFormat, DownloadProgress } from "@/types/download";

/**
 * Hook for downloading YouTube audio via Server-Sent Events (SSE).
 *
 * The download API streams progress updates and the final audio data as SSE messages.
 * Each message follows the format: "data: {json}\n\n"
 */
export function useDownload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const clearError = () => setError(null);

  const download = async (
    url: string,
    format: DownloadFormat
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setProgress({ type: "progress", percent: 0, stage: "downloading" });

    let success = false;

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

      /**
       * Processes a single SSE message line.
       * Handles progress updates, completion (triggers file download), and errors.
       */
      const processLine = (line: string) => {
        if (!line.startsWith("data: ")) return;

        const data = JSON.parse(line.slice(6)) as DownloadProgress;
        setProgress(data);

        // On completion, convert base64 audio data to blob and trigger browser download
        if (data.type === "complete" && data.data) {
          const blob = base64ToBlob(
            data.data,
            data.contentType || "audio/mpeg"
          );
          triggerDownload(blob, data.filename || `audio.${format}`);
          success = true;
        }

        if (data.type === "error") {
          throw new Error(data.error || "Download failed");
        }
      };

      // Read the SSE stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append decoded chunk to buffer and split on SSE delimiter
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        // Keep incomplete message in buffer for next iteration
        buffer = lines.pop() || "";

        for (const line of lines) {
          processLine(line);
        }
      }

      // Process any remaining data in buffer after stream ends
      // This ensures the final "complete" message is not missed
      if (buffer.trim()) {
        processLine(buffer.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      success = false;
    } finally {
      setIsLoading(false);
      // Keep progress visible briefly so user sees completion state
      setTimeout(() => setProgress(null), 1500);
    }

    return success;
  };

  return {
    download,
    isLoading,
    progress,
    error,
    clearError,
  };
}
