import { create } from "zustand";
import type { RecentDownload } from "@/types/download";

type SelectedDownloadState = {
  selectedDownload: RecentDownload | null;
  formKey: number;
  selectDownload: (download: RecentDownload) => void;
  clearSelection: () => void;
};

export const useSelectedDownload = create<SelectedDownloadState>((set) => ({
  selectedDownload: null,
  formKey: 0,
  selectDownload: (download) =>
    set((state) => ({
      selectedDownload: download,
      // Increment key to force DownloadForm to remount with new initial values
      formKey: state.formKey + 1,
    })),
  clearSelection: () => set({ selectedDownload: null }),
}));
