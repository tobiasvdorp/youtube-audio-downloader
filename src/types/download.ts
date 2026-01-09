export type AudioFormat = "mp3" | "wav" | "m4a" | "webm";

export type DownloadRequest = {
  url: string;
  format: AudioFormat;
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
