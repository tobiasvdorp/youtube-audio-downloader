import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { formatDuration } from "@/lib/utils";

const execAsync = promisify(exec);

type YtDlpInfo = {
  title: string;
  uploader: string;
  duration: number;
  thumbnail: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Use yt-dlp to get video info as JSON (--no-playlist to avoid fetching entire playlists)
    const { stdout } = await execAsync(
      `yt-dlp --no-playlist --dump-json --no-download "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const info: YtDlpInfo = JSON.parse(stdout);

    console.log(`[Info] Lookup: "${info.title}" by ${info.uploader}`);

    return NextResponse.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: formatDuration(info.duration),
      author: info.uploader,
    });
  } catch (error) {
    console.error("Error fetching video info:", error);
    return NextResponse.json(
      { error: "Could not fetch video information" },
      { status: 500 }
    );
  }
}
