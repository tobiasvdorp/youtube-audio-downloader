"use client";

import { DownloadForm } from "@/components/download-form";
import { RecentDownloadsSidebar } from "@/components/recent-downloads-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { WaveBars } from "@/components/wave-bars";
import { Github, Info, Play } from "lucide-react";
import { useSelectedDownload } from "@/hooks/useSelectedDownload";

export default function Home() {
  const formKey = useSelectedDownload((state) => state.formKey);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Top right controls */}
      <div className="fixed top-3 right-3 xs:top-6 xs:right-6 z-40 flex flex-col-reverse xs:flex-row items-center gap-2 xs:gap-3">
        <ThemeToggle />
        <RecentDownloadsSidebar />
      </div>

      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      {/* Audio wave decoration */}
      <WaveBars variant="left" />
      <WaveBars variant="right" />

      {/* Main content */}
      <div className="w-full max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-sm text-primary font-medium mb-4">
            <Play className="size-4" />
            YouTube to Audio
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="gradient-text">Beats</span>{" "}
            <span className="text-foreground">Downloader</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Download your favorite YouTube beats in high quality MP3 or WAV
            format
          </p>
        </div>

        {/* Download Form - key forces remount when selecting recent download */}
        <DownloadForm key={formKey} />

        {/* Legal Notice */}
        <div className="flex gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-sm">
          <Info className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Legal use only.</span>{" "}
            Use this tool only for content you own or that is licensed for reuse
            (e.g. Creative Commons). You are responsible for respecting
            copyright laws.
          </p>
        </div>

        {/* GitHub Link */}
        <div className="flex justify-center">
          <a
            href="https://github.com/tobiasvdorp/youtube-audio-downloader"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="size-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
