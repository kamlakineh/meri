import { cn } from "@/lib/cn";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Deterministic pastel per name, so each row in a people list reads as a
// distinct person at a glance instead of one flat brand-color wash.
const PALETTE = [
  "bg-[#EFE3FF] text-[#7C3AED]",
  "bg-[#DCFCE7] text-[#15803D]",
  "bg-[#FFE4E6] text-[#BE123C]",
  "bg-[#DBEAFE] text-[#1D4ED8]",
  "bg-[#FEF3C7] text-[#B45309]",
  "bg-[#E0F2FE] text-[#0369A1]",
  "bg-[#FCE7F3] text-[#A21CAF]",
  "bg-[#E7E5E4] text-[#44403C]",
] as const;

function paletteFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({
  name,
  size = 36,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
        paletteFor(name),
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
