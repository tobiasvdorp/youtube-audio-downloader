import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

type YtDlpInfo = {
  title: string;
  uploader: string;
  duration: number;
  thumbnail: string;
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is vereist" }, { status: 400 });
    }

    // Use yt-dlp to get video info as JSON
    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-download "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const info: YtDlpInfo = JSON.parse(stdout);

    return NextResponse.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: formatDuration(info.duration),
      author: info.uploader,
    });
  } catch (error) {
    console.error("Error fetching video info:", error);
    return NextResponse.json(
      { error: "Kon video informatie niet ophalen" },
      { status: 500 }
    );
  }
}
