"use client";

import { QRCodeSVG } from "qrcode.react";
import type { CardData, CardSchool } from "@/lib/card-types";

export const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
export const SERIF = 'Georgia, "Times New Roman", Times, serif';

export function cardFontFamily(school: CardSchool, templateFont: string): string {
  if (school.cardFont === "sans") return SANS;
  if (school.cardFont === "serif") return SERIF;
  return templateFont;
}

export function headerFontSize(school: CardSchool, templateSize: number): number {
  return school.cardHeaderSize ?? templateSize;
}

export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter((p) => p.length > 2 || /^[A-ZÀ-Ý]/.test(p));
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

export function officialHeader(school: CardSchool): string {
  return school.cardHeader?.trim() || school.authority?.trim() || "";
}

export function reverseMessage(school: CardSchool, fallback: string): string {
  return school.cardBackText?.trim() || fallback;
}

export function signatoryLabel(school: CardSchool): string {
  return [school.signatoryTitle?.trim() || "Le directeur", school.signatoryName?.trim()]
    .filter(Boolean)
    .join(" : ");
}

const LEVEL_COLORS = ["#E4572E", "#17A398", "#3D5AFE", "#E39B00", "#8E44AD", "#2E9E5B"];

/** Une couleur stable par niveau : 6eA et 6eB partagent la même couleur. */
export function levelColor(classe: string): string {
  const level = classe.trim().replace(/[\s-]?[A-Z]$/, "") || classe;
  let h = 0;
  for (const ch of level) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return LEVEL_COLORS[h % LEVEL_COLORS.length];
}

export function Photo({
  src, width, height, radius = 0, tint = "#E6E9EF", style,
}: { src?: string; width: number; height: number; radius?: number; tint?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ width, height, borderRadius: radius, overflow: "hidden", background: tint, flexShrink: 0, ...style }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <svg viewBox="0 0 100 130" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" aria-hidden>
          <circle cx="50" cy="48" r="20" fill="#fff" opacity=".85" />
          <path d="M8 130c0-30 18-48 42-48s42 18 42 48z" fill="#fff" opacity=".85" />
        </svg>
      )}
    </div>
  );
}

export function Logo({
  school, size, ring = "#fff", fg, bg = "rgba(255,255,255,.16)",
}: { school: CardSchool; size: number; ring?: string; fg?: string; bg?: string }) {
  if (school.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={school.logoUrl} alt="" style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />;
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0, background: bg,
        border: `${Math.max(2, size / 28)}px solid ${ring}`, color: fg ?? ring,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: SERIF, fontWeight: 700, fontSize: size * 0.38, letterSpacing: 1,
      }}
    >
      {initials(school.name)}
    </div>
  );
}

export function QR({ data, size, fg = "#111713", bg = "#ffffff" }: { data: CardData; size: number; fg?: string; bg?: string }) {
  return (
    <QRCodeSVG
      value={data.verifyUrl ?? data.student.matricule}
      size={size}
      fgColor={fg}
      bgColor={bg}
      level="M"
      marginSize={0}
    />
  );
}

export function Field({
  label, value, labelColor = "#6b7280", valueColor = "#111713", size = 26, labelSize = 17, font = SANS, weight = 600,
}: {
  label: string; value: string; labelColor?: string; valueColor?: string; size?: number; labelSize?: number; font?: string; weight?: number;
}) {
  return (
    <div style={{ fontFamily: font }}>
      <div style={{ fontSize: labelSize, color: labelColor, lineHeight: 1.2 }}>{label}</div>
      <div style={{ fontSize: size, color: valueColor, fontWeight: weight, lineHeight: 1.25, marginTop: 2 }}>{value}</div>
    </div>
  );
}

export function birthLine(d: CardData): string {
  const s = d.student;
  return s.lieuNaissance ? `${s.dateNaissance} à ${s.lieuNaissance}` : s.dateNaissance;
}

export function bornLabel(d: CardData): string {
  return d.student.sexe === "F" ? "Née le" : "Né le";
}
