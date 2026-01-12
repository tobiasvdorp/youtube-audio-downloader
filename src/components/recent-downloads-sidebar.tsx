"use client";

import { useState } from "react";
import Image from "next/image";
import { History, Trash2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useRecentDownloadsStore } from "@/hooks/useRecentDownloads";
import { useSelectedDownload } from "@/hooks/useSelectedDownload";
import type { RecentDownload } from "@/types/download";

export function RecentDownloadsSidebar() {
  const recentDownloads = useRecentDownloadsStore(
    (state) => state.recentDownloads
  );
  const removeDownload = useRecentDownloadsStore(
    (state) => state.removeDownload
  );
  const clearAll = useRecentDownloadsStore((state) => state.clearAll);
  const selectDownload = useSelectedDownload((state) => state.selectDownload);
  const [open, setOpen] = useState(false);

  const handleSelectDownload = (download: RecentDownload) => {
    selectDownload(download);
    setOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "fixed top-6 right-6 z-40 size-12 rounded-full border-2 border-border/50 bg-background/80 backdrop-blur-sm transition-all hover:scale-105 hover:border-primary/50 hover:bg-primary/10",
            {
              "border-primary/50 bg-primary/10": recentDownloads.length > 0,
            }
          )}
        >
          <History className="size-5" />
          {recentDownloads.length > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {recentDownloads.length}
            </span>
          )}
          <span className="sr-only">Recent downloads</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-hidden">
        <SheetHeader className="border-b border-border/50 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Recent Downloads
          </SheetTitle>
          <SheetDescription>
            Click on a video to download it again
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {recentDownloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <History className="size-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                No recent downloads
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Your downloaded videos will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDownloads.map((download) => (
                <div
                  key={download.id}
                  className="group relative rounded-xl border border-border/50 bg-secondary/30 p-3 transition-all hover:border-primary/30 hover:bg-secondary/50"
                >
                  <button
                    onClick={() => handleSelectDownload(download)}
                    className="flex w-full gap-3 text-left pr-6 cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <Image
                        src={download.thumbnail}
                        alt={download.title}
                        width={80}
                        height={45}
                        className="w-20 h-[45px] object-cover rounded-lg"
                        unoptimized
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] font-medium text-white">
                        {download.duration}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                        {download.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {download.author}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
                          {download.format}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {formatDate(download.downloadedAt)}
                        </span>
                      </div>
                    </div>
                    <Download className="size-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 self-center" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDownload(download.id);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all z-10 cursor-pointer"
                    aria-label="Remove from history"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {recentDownloads.length > 0 && (
          <div className="border-t border-border/50 pt-4 px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
            >
              <Trash2 className="size-4 mr-2" />
              Clear All History
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
