"use client";

import { useState } from "react";
import Image from "next/image";
import { list } from "radash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { cn, isValidYoutubeUrl } from "@/lib/utils";
import { useVideoInfo } from "@/hooks/useVideoInfo";
import { useDownload } from "@/hooks/useDownload";
import type { DownloadFormat } from "@/types/download";

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
  const [format, setFormat] = useState<DownloadFormat>("mp3");
  const { url, setUrl, videoInfo, isLoading: fetchingInfo } = useVideoInfo();
  const { download, isLoading, progress, error, clearError } = useDownload();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    clearError();
  };

  const handleDownload = async () => {
    if (!url) {
      return;
    }

    if (!isValidYoutubeUrl(url)) {
      return;
    }

    await download(url, format);
  };

  return (
    <div className={cn("w-full max-w-2xl space-y-8", className)}>
      {/* URL Input */}
      <div className="space-y-3">
        <Label htmlFor="url-input">YouTube URL</Label>
        <div className="relative">
          <Input
            id="url-input"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleUrlChange}
            className="pr-12"
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
        <Label>Format</Label>
        <RadioGroup
          value={format}
          onValueChange={(value) => setFormat(value as DownloadFormat)}
          className="grid grid-cols-1 xs:grid-cols-2 gap-3"
        >
          {FORMAT_OPTIONS.map((option) => {
            const isSelected = format === option.value;
            return (
              <label
                key={option.value}
                htmlFor={`format-${option.value}`}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
                  {
                    "border-primary bg-primary/10": isSelected,
                    "border-border/50 bg-secondary/30": !isSelected,
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
                    "size-10 rounded-lg flex items-center justify-center font-bold text-xs aspect-square",
                    {
                      "bg-primary text-primary-foreground": isSelected,
                      "bg-muted text-muted-foreground": !isSelected,
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
            );
          })}
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
                {list(0, 4).map((i) => (
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
