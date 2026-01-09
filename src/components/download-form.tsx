"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type {
  DownloadFormat,
  VideoInfo,
  DownloadProgress,
} from "@/types/download";

const FORMAT_OPTIONS: {
  value: DownloadFormat;
  label: string;
  description: string;
}[] = [
  { value: "mp3", label: "MP3", description: "Universal, small file" },
  { value: "wav", label: "WAV", description: "Lossless, large file" },
];

type DownloadFormProps = {
  className?: string;
};

export function DownloadForm({ className }: DownloadFormProps) {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<DownloadFormat>("mp3");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isValidYoutubeUrl = (testUrl: string) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;
    return regex.test(testUrl);
  };

  const fetchVideoInfo = async (videoUrl: string) => {
    if (!isValidYoutubeUrl(videoUrl)) {
      setVideoInfo(null);
      return;
    }

    setFetchingInfo(true);
    try {
      const response = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setVideoInfo(data);
        setError(null);
      } else {
        setVideoInfo(null);
      }
    } catch {
      setVideoInfo(null);
    } finally {
      setFetchingInfo(false);
    }
  };

  // Debounced video info fetch
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (url) {
      debounceRef.current = setTimeout(() => {
        fetchVideoInfo(url);
      }, 500);
    } else {
      setVideoInfo(null);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [url]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleDownload = async () => {
    if (!url) {
      setError("Enter a YouTube URL");
      return;
    }

    if (!isValidYoutubeUrl(url)) {
      setError("Enter a valid YouTube URL");
      return;
    }

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
              // Convert base64 to blob and download
              const binaryString = atob(data.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], {
                type: data.contentType || "audio/mpeg",
              });

              const downloadUrl = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = downloadUrl;
              a.download = data.filename || `audio.${format}`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(downloadUrl);
              document.body.removeChild(a);
            }

            if (data.type === "error") {
              throw new Error(data.error || "Download failed");
            }
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
      // Reset progress after a short delay
      setTimeout(() => setProgress(null), 1500);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl space-y-8", className)}>
      {/* URL Input */}
      <div className="space-y-3">
        <label
          htmlFor="url-input"
          className="text-sm font-medium text-muted-foreground"
        >
          YouTube URL
        </label>
        <div className="relative">
          <Input
            id="url-input"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleUrlChange}
            className="h-14 bg-secondary/50 border-border/50 text-lg placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 transition-all pr-12"
          />
          {fetchingInfo && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Video Preview */}
      {videoInfo && (
        <div className="flex gap-4 p-4 bg-secondary/30 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <Image
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            width={128}
            height={80}
            className="w-32 h-20 object-cover rounded-lg"
            unoptimized
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {videoInfo.title}
            </h3>
            <p className="text-sm text-muted-foreground">{videoInfo.author}</p>
            <p className="text-xs text-muted-foreground/70">
              {videoInfo.duration}
            </p>
          </div>
        </div>
      )}

      {/* Format Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Format
        </label>
        <RadioGroup
          value={format}
          onValueChange={(value) => setFormat(value as DownloadFormat)}
          className="grid grid-cols-2 gap-3"
        >
          {FORMAT_OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`format-${option.value}`}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                {
                  "border-primary bg-primary/10": format === option.value,
                  "border-border/50 bg-secondary/30 hover:border-border":
                    format !== option.value,
                }
              )}
            >
              <RadioGroupItem
                value={option.value}
                id={`format-${option.value}`}
                className="sr-only"
              />
              <div
                className={cn(
                  "size-10 rounded-lg flex items-center justify-center font-bold text-xs",
                  {
                    "bg-primary text-primary-foreground":
                      format === option.value,
                    "bg-muted text-muted-foreground": format !== option.value,
                  }
                )}
              >
                {option.label}
              </div>
              <div className="text-left">
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Download Button with Progress */}
      <div className="space-y-3">
        <Button
          onClick={handleDownload}
          disabled={isLoading || !url}
          className="w-full h-16 text-xl font-bold glow-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="flex items-end gap-1 h-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary-foreground rounded-full wave-bar"
                    style={{ height: "100%" }}
                  />
                ))}
              </div>
              <span>
                {progress?.stage === "converting"
                  ? "Converting..."
                  : "Downloading..."}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download {format.toUpperCase()}</span>
            </div>
          )}
        </Button>

        {/* Progress Bar */}
        {progress && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Progress
              value={progress.percent || 0}
              className="h-3 bg-secondary/50"
              indicatorClassName={cn({
                "bg-linear-to-r from-primary to-primary/80":
                  progress.stage === "downloading",
                "bg-linear-to-r from-green-500 to-green-400":
                  progress.type === "complete",
                "bg-linear-to-r from-amber-500 to-amber-400":
                  progress.stage === "converting",
              })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {progress.type === "complete"
                  ? "✓ Completed!"
                  : progress.stage === "converting"
                    ? "Converting to " + format.toUpperCase()
                    : "Downloading..."}
              </span>
              <div className="flex gap-3">
                {progress.speed && (
                  <span className="font-mono">{progress.speed}</span>
                )}
                {progress.eta && (
                  <span className="font-mono">ETA: {progress.eta}</span>
                )}
                <span className="font-medium">
                  {Math.round(progress.percent || 0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
