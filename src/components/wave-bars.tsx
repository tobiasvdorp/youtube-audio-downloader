import { cn } from "@/lib/utils";

const WAVE_CONFIG = {
  left: {
    heights: [40, 65, 85, 55, 75, 45, 90, 60, 70, 50],
    position: "left-8",
    barColor: "bg-primary",
  },
  right: {
    heights: [50, 70, 60, 90, 45, 75, 55, 85, 65, 40],
    position: "right-8",
    barColor: "bg-accent",
  },
} as const;

type WaveBarsProps = {
  variant: "left" | "right";
  className?: string;
};

export function WaveBars({ variant, className }: WaveBarsProps) {
  const { heights, position, barColor } = WAVE_CONFIG[variant];

  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 flex items-end gap-1.5 opacity-20",
        position,
        className
      )}
    >
      {heights.map((height, i) => (
        <div
          key={i}
          className={cn("w-1.5 rounded-full wave-bar", barColor)}
          style={{
            height: `${height}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
