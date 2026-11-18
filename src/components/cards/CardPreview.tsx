import type { CardData, CardSide } from "@/lib/card-types";
import { getTemplate } from "./index";
import { useEffect, useRef, useState } from "react";

/** Affiche une carte à l'échelle (la carte est dessinée en 856 × 540 px, 10 px = 1 mm). */
export default function CardPreview({ templateId, data, side, scale }: { templateId: string; data: CardData; side: CardSide; scale: number }) {
  const t = getTemplate(templateId);
  const previewRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const previewScale = availableWidth === null ? scale : Math.min(scale, availableWidth / t.size.w);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const observer = new ResizeObserver(([entry]) => {
      setAvailableWidth(entry.contentRect.width);
    });
    observer.observe(preview);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={previewRef} style={{ width: t.size.w * scale, maxWidth: "100%", height: t.size.h * previewScale, overflow: "hidden", boxSizing: "border-box", border: `${Math.max(1, previewScale)}px solid rgba(255,255,255,.9)`, boxShadow: "0 18px 44px rgba(15,23,42,.2)", borderRadius: 26 * previewScale }}>
      <div style={{ width: t.size.w, height: t.size.h, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
        <t.Component data={data} side={side} />
      </div>
    </div>
  );
}
