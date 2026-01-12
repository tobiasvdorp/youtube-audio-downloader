"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RecentDownload,
  VideoInfo,
  DownloadFormat,
} from "@/types/download";

const MAX_RECENT_DOWNLOADS = 10;
const STORAGE_KEY = "recent-downloads";

type RecentDownloadsState = {
  recentDownloads: RecentDownload[];
  addDownload: (
    videoInfo: VideoInfo,
    url: string,
    format: DownloadFormat
  ) => void;
  removeDownload: (id: string) => void;
  clearAll: () => void;
};

export const useRecentDownloadsStore = create<RecentDownloadsState>()(
  persist(
    (set) => ({
      recentDownloads: [],

      addDownload: (videoInfo, url, format) => {
        const newDownload: RecentDownload = {
          id: `${url}-${Date.now()}`,
          url,
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          author: videoInfo.author,
          duration: videoInfo.duration,
          format,
          downloadedAt: new Date().toISOString(),
        };

        set((state) => {
          // Remove duplicate URL if exists
          const filtered = state.recentDownloads.filter((d) => d.url !== url);
          // Add new download at the beginning and limit to max
          return {
            recentDownloads: [newDownload, ...filtered].slice(
              0,
              MAX_RECENT_DOWNLOADS
            ),
          };
        });
      },

      removeDownload: (id) => {
        set((state) => ({
          recentDownloads: state.recentDownloads.filter((d) => d.id !== id),
        }));
      },

      clearAll: () => {
        set({ recentDownloads: [] });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
