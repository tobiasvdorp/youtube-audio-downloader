export type DownloadFormat = "mp3" | "wav";

export type DownloadRequest = {
  url: string;
  format: DownloadFormat;
};

export type DownloadResponse = {
  success: boolean;
  title?: string;
  error?: string;
};

export type VideoInfo = {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
};

export type DownloadProgress = {
  type: "progress" | "complete" | "error";
  percent?: number;
  speed?: string;
  eta?: string;
  stage?: "downloading" | "converting";
  error?: string;
  data?: string; // base64 encoded audio data
  filename?: string;
  contentType?: string;
};

export type RecentDownload = VideoInfo & {
  id: string;
  url: string;
  format: DownloadFormat;
  downloadedAt: string;
};
