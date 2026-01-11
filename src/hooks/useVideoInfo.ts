"use client";

import { useState, useEffect } from "react";
import { useDebounceValue } from "usehooks-ts";
import { isValidYoutubeUrl } from "@/lib/utils";
import type { VideoInfo } from "@/types/download";

type UseVideoInfoReturn = {
  url: string;
  setUrl: (url: string) => void;
  videoInfo: VideoInfo | null;
  isLoading: boolean;
  isValidUrl: boolean;
};

export function useVideoInfo(debounceMs = 500): UseVideoInfoReturn {
  const [url, setUrl] = useState("");
  const [debouncedUrl] = useDebounceValue(url, debounceMs);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidUrl = isValidYoutubeUrl(url);

  useEffect(() => {
    if (!debouncedUrl || !isValidYoutubeUrl(debouncedUrl)) {
      setVideoInfo(null);
      return;
    }

    const fetchVideoInfo = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: debouncedUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          setVideoInfo(data);
        } else {
          setVideoInfo(null);
        }
      } catch {
        setVideoInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoInfo();
  }, [debouncedUrl]);

  return {
    url,
    setUrl,
    videoInfo,
    isLoading,
    isValidUrl,
  };
}
