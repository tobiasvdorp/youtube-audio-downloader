import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import type { AudioFormat } from "@/types/download";

const execAsync = promisify(exec);

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  const tempDir = "/tmp/youtube-downloads";
  const tempId = randomUUID();
  const tempPath = join(tempDir, tempId);

  try {
    const body = await request.json();
    const { url, format } = body as { url: string; format: AudioFormat };

    if (!url) {
      return NextResponse.json({ error: "URL is vereist" }, { status: 400 });
    }

    if (!format || !["mp3", "wav", "m4a", "webm"].includes(format)) {
      return NextResponse.json({ error: "Ongeldig formaat" }, { status: 400 });
    }

    // Create temp directory
    await mkdir(tempDir, { recursive: true });

    // Get video title first
    const { stdout: infoJson } = await execAsync(
      `yt-dlp --dump-json --no-download "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    const info = JSON.parse(infoJson);
    const title = sanitizeFilename(info.title);
    const filename = `${title}.${format}`;

    // Download and convert to temp file
    // yt-dlp will add the extension automatically
    const outputPath = `${tempPath}.${format}`;

    await execAsync(
      `yt-dlp -f bestaudio --extract-audio --audio-format ${format} --audio-quality 0 -o "${tempPath}.%(ext)s" "${url}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    // Read the file
    const audioData = await readFile(outputPath);

    // Clean up temp file
    await unlink(outputPath).catch(() => {});

    const contentTypes: Record<AudioFormat, string> = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      m4a: "audio/mp4",
      webm: "audio/webm",
    };
    const contentType = contentTypes[format];

    return new NextResponse(audioData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": audioData.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Download error:", error);

    // Clean up on error
    await unlink(`${tempPath}.mp3`).catch(() => {});
    await unlink(`${tempPath}.wav`).catch(() => {});
    await unlink(`${tempPath}.m4a`).catch(() => {});
    await unlink(`${tempPath}.webm`).catch(() => {});

    return NextResponse.json(
      { error: "Download mislukt. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
