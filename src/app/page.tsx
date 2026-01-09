import { DownloadForm } from "@/components/download-form";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      {/* Audio wave decoration */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-end gap-1.5 opacity-20">
        {[40, 65, 85, 55, 75, 45, 90, 60, 70, 50].map((height, i) => (
          <div
            key={i}
            className="w-1.5 bg-primary rounded-full wave-bar"
            style={{
              height: `${height}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-end gap-1.5 opacity-20">
        {[50, 70, 60, 90, 45, 75, 55, 85, 65, 40].map((height, i) => (
          <div
            key={i}
            className="w-1.5 bg-accent rounded-full wave-bar"
            style={{
              height: `${height}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="w-full max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-sm text-primary font-medium mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            YouTube to Audio
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="gradient-text">Beats</span>{" "}
            <span className="text-foreground">Downloader</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Download your favorite YouTube beats in high quality MP3 or WAV
            format
          </p>
        </div>

        {/* Download Form */}
        <DownloadForm />

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50">
          Use this tool only for content you have rights to
        </p>
      </div>
    </main>
  );
}
