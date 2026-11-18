import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function LogoMark({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  const body = onDark ? "#B0EE0A" : "#050705";
  const glyph = onDark ? "#050705" : "#B0EE0A";
  return (
    <svg viewBox="0 0 36 26" className={className || "h-[26px] w-9"} aria-hidden="true">
      <rect width="36" height="26" rx="6" fill={body} />
      <circle cx="11" cy="10.5" r="3.6" fill={glyph} />
      <path d="M5 21c.7-3.6 3-5 6-5s5.3 1.4 6 5z" fill={glyph} />
      <rect x="21" y="8" width="10" height="2.4" rx="1.2" fill={glyph} />
      <rect x="21" y="13" width="7" height="2.4" rx="1.2" fill={glyph} opacity=".6" />
    </svg>
  );
}

export default function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 text-[1.05rem] font-bold tracking-tight">
      <LogoMark onDark={light} />
      <span className={light ? "text-white" : "text-ink"}>{BRAND}</span>
    </Link>
  );
}
