import { NextRequest } from "next/server";
import { spawn, exec } from "child_process";
import { promisify } from "util";
import { readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import type { DownloadFormat, DownloadProgress } from "@/types/download";

const execAsync = promisify(exec);

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 100);
}

function parseProgress(line: string): Partial<DownloadProgress> | null {
  // Parse yt-dlp progress output like: [download]  45.2% of 10.00MiB at  2.50MiB/s ETA 00:05
  const downloadMatch = line.match(
    /\[download\]\s+(\d+\.?\d*)%\s+of\s+[\d.]+\w+\s+at\s+([\d.]+\w+\/s)(?:\s+ETA\s+(\S+))?/
  );
  if (downloadMatch) {
    return {
      type: "progress",
      percent: parseFloat(downloadMatch[1]),
      speed: downloadMatch[2],
      eta: downloadMatch[3] || undefined,
      stage: "downloading",
    };
  }

  // Parse conversion stage
  if (
    line.includes("[ExtractAudio]") ||
    line.includes("[Postprocessor]") ||
    line.includes("ffmpeg")
  ) {
    return {
      type: "progress",
      percent: 100,
      stage: "converting",
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const tempDir = "/tmp/youtube-downloads";
  const tempId = randomUUID();
  const tempPath = join(tempDir, tempId);

  try {
    const body = await request.json();
    const { url, format } = body as { url: string; format: DownloadFormat };

    if (!url) {
      return new Response(
        JSON.stringify({ type: "error", error: "URL is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!format || !["mp3", "wav"].includes(format)) {
      return new Response(
        JSON.stringify({ type: "error", error: "Invalid format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create temp directory
    await mkdir(tempDir, { recursive: true });

    // Get video title first (--no-playlist to avoid fetching entire playlists)
    const { stdout: infoJson } = await execAsync(
      `yt-dlp --no-playlist --dump-json --no-download "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    const info = JSON.parse(infoJson);
    const title = sanitizeFilename(info.title);
    const filename = `${title}.${format}`;
    const outputPath = `${tempPath}.${format}`;

    const contentTypes: Record<DownloadFormat, string> = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
    };
    const contentType = contentTypes[format];

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (progress: DownloadProgress) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(progress)}\n\n`)
          );
        };

        try {
          // Start download with spawn to capture real-time progress
          await new Promise<void>((resolve, reject) => {
            const ytdlp = spawn("yt-dlp", [
              "--no-playlist",
              "-f",
              "bestaudio",
              "--extract-audio",
              "--audio-format",
              format,
              "--audio-quality",
              "0",
              "--newline",
              "-o",
              `${tempPath}.%(ext)s`,
              url,
            ]);

            let lastPercent = 0;

            ytdlp.stdout.on("data", (data: Buffer) => {
              const lines = data.toString().split("\n");
              for (const line of lines) {
                const progress = parseProgress(line);
                if (progress && progress.percent !== undefined) {
                  // Only send updates every 2% to reduce noise
                  if (
                    progress.stage === "converting" ||
                    progress.percent - lastPercent >= 2
                  ) {
                    lastPercent = progress.percent;
                    sendProgress(progress as DownloadProgress);
                  }
                }
              }
            });

            ytdlp.stderr.on("data", (data: Buffer) => {
              const lines = data.toString().split("\n");
              for (const line of lines) {
                const progress = parseProgress(line);
                if (progress && progress.percent !== undefined) {
                  if (
                    progress.stage === "converting" ||
                    progress.percent - lastPercent >= 2
                  ) {
                    lastPercent = progress.percent;
                    sendProgress(progress as DownloadProgress);
                  }
                }
              }
            });

            ytdlp.on("close", (code) => {
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(`yt-dlp exited with code ${code}`));
              }
            });

            ytdlp.on("error", reject);
          });

          // Read the completed file and send as base64
          const audioData = await readFile(outputPath);
          const base64Data = audioData.toString("base64");

          // Send completion with data
          sendProgress({
            type: "complete",
            percent: 100,
            data: base64Data,
            filename,
            contentType,
          });

          // Clean up temp file
          await unlink(outputPath).catch(() => {});
        } catch (error) {
          console.error("Download error:", error);

          // Clean up on error
          await unlink(`${tempPath}.mp3`).catch(() => {});
          await unlink(`${tempPath}.wav`).catch(() => {});

          sendProgress({
            type: "error",
            error: "Download failed. Please try again.",
          });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Download error:", error);

    return new Response(
      JSON.stringify({
        type: "error",
        error: "Download failed. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
