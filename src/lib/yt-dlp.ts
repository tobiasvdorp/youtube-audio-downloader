import { existsSync, writeFileSync } from "fs";
import { join } from "path";

const COOKIES_PATH = process.env.COOKIES_PATH || "/tmp/cookies.txt";
const LOCAL_COOKIES_PATH = join(process.cwd(), "cookies.txt");

let cookiesInitialized = false;

/**
 * Initializes cookies from base64 environment variable if set
 * This allows deploying to Railway/Render without committing cookies to git
 */
function initCookiesFromEnv(): void {
  if (cookiesInitialized) return;
  cookiesInitialized = true;

  const base64Cookies = process.env.YT_COOKIES_BASE64;
  if (!base64Cookies) return;

  try {
    const cookiesContent = Buffer.from(base64Cookies, "base64").toString(
      "utf-8"
    );
    writeFileSync(COOKIES_PATH, cookiesContent, "utf-8");
    console.log("[yt-dlp] Cookies initialized from YT_COOKIES_BASE64");
  } catch (error) {
    console.error("[yt-dlp] Failed to initialize cookies from env:", error);
  }
}

/**
 * Gets the path to the cookies file if it exists
 * Checks env variable, Docker mount path, and local development path
 */
export function getCookiesPath(): string | null {
  initCookiesFromEnv();

  if (existsSync(COOKIES_PATH)) {
    console.log(`[yt-dlp] Using cookies from: ${COOKIES_PATH}`);
    return COOKIES_PATH;
  }
  if (existsSync(LOCAL_COOKIES_PATH)) {
    console.log(`[yt-dlp] Using cookies from: ${LOCAL_COOKIES_PATH}`);
    return LOCAL_COOKIES_PATH;
  }
  console.warn("[yt-dlp] No cookies file found");
  return null;
}

/**
 * Gets the cookies flag arguments for yt-dlp
 * Returns an array of args to spread into the command
 */
export function getCookiesArgs(): string[] {
  const cookiesPath = getCookiesPath();
  if (!cookiesPath) return [];
  return ["--cookies", cookiesPath];
}

/**
 * Gets the cookies flag as a string for shell commands
 */
export function getCookiesFlag(): string {
  const cookiesPath = getCookiesPath();
  if (!cookiesPath) return "";
  return `--cookies "${cookiesPath}"`;
}
