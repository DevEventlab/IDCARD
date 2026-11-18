import { LANDSCAPE, type CardProps } from "@/lib/card-types";
import { Logo, Photo, QR, SERIF, birthLine, bornLabel, cardFontFamily, headerFontSize, initials, officialHeader, reverseMessage, signatoryLabel } from "./shared";

const { w, h } = LANDSCAPE;

/** Fond guilloché (cercles concentriques décalés) : motif anti-copie discret. */
function Guilloche({ color, id }: { color: string; id: string }) {
  const rings = Array.from({ length: 14 }, (_, i) => 30 + i * 22);
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        <pattern id={id} width="120" height="120" patternUnits="userSpaceOnUse">
          {rings.slice(0, 5).map((r, i) => (
            <circle key={i} cx="60" cy="60" r={10 + i * 12} fill="none" stroke={color} strokeWidth="0.8" opacity="0.16" />
          ))}
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
    </svg>
  );
}

function Seal({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ width: 104, height: 104, borderRadius: "50%", border: `3px double ${color}`, color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 32, fontWeight: 700, transform: "rotate(-12deg)", background: "rgba(255,255,255,.78)" }}>
      {text}
    </div>
  );
}

export default function Institutionnel({ data, side }: CardProps) {
  const { school: sc, student: st } = data;
  const root: React.CSSProperties = { width: w, height: h, position: "relative", overflow: "hidden", background: "#fdfdfc", fontFamily: cardFontFamily(sc, SERIF), borderRadius: 26, color: "#1b1f2a" };
  const rule = <div style={{ borderTop: `1.5px solid ${sc.primary}`, borderBottom: `1.5px solid ${sc.primary}`, height: 4, opacity: 0.85 }} />;
  const rows: [string, string][] = [
    ["Nom", st.nom.toUpperCase()],
    ["Prénoms", st.prenoms],
    [bornLabel(data), birthLine(data)],
    ["Classe", st.classe],
    ["Matricule", st.matricule],
  ];

  if (side === "front") {
    return (
      <div style={root}>
        <Guilloche color={sc.primary} id="g-front" />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-44%)", opacity: 0.07 }}>
          <Logo school={sc} size={330} ring={sc.primary} fg={sc.primary} bg="transparent" />
        </div>
        <div style={{ position: "absolute", top: 30, left: 44, right: 44, textAlign: "center" }}>
          {officialHeader(sc) && <div style={{ maxHeight: 40, overflow: "hidden", fontSize: headerFontSize(sc, 15), lineHeight: 1.2, letterSpacing: 1.5, textTransform: "uppercase", color: "#4b5563" }}>{officialHeader(sc)}</div>}
          <div style={{ fontSize: 31, fontWeight: 700, color: sc.primary, margin: "6px 0 10px" }}>{sc.name}</div>
          {rule}
        </div>
        <div style={{ position: "absolute", left: 44, top: 142, width: 214, height: 286, border: `2px solid ${sc.primary}`, padding: 4, background: "#fff" }}>
          <Photo src={st.photoUrl} width={202} height={274} />
        </div>
        <div style={{ position: "absolute", left: 186, top: 372 }}>
          <Seal text={initials(sc.name)} color={sc.secondary} />
        </div>
        <div style={{ position: "absolute", left: 296, top: 142, right: 44 }}>
          {rows.map(([l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "baseline", borderBottom: "1px solid rgba(20,33,61,.18)", padding: "8px 0" }}>
              <div style={{ width: 150, fontSize: 18, fontStyle: "italic", color: "#6b7280" }}>{l}</div>
              <div style={{ fontSize: 25, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 44, right: 44, bottom: 26, display: "flex", justifyContent: "space-between", fontSize: 18, color: "#4b5563" }}>
          <span>Année scolaire {st.anneeScolaire}</span>
          <span style={{ fontStyle: "italic" }}>Valable pour l&apos;année en cours</span>
        </div>
      </div>
    );
  }

  return (
    <div style={root}>
      <Guilloche color={sc.primary} id="g-back" />
      <div style={{ position: "absolute", top: 30, left: 44, right: 44, textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: sc.primary, marginBottom: 10 }}>{sc.name}</div>
        {rule}
      </div>
      <div style={{ position: "absolute", top: 118, left: 44, right: 260, fontSize: 21, lineHeight: 1.55 }}>
        <p style={{ margin: 0, maxHeight: 180, overflow: "hidden", whiteSpace: "pre-line" }}>
          {reverseMessage(sc, "Cette carte atteste de l'inscription de son titulaire. Elle est personnelle, non cessible, et doit être présentée à toute demande.")}
        </p>
        <div style={{ marginTop: 18, color: "#374151" }}>
          {sc.address && <div>{sc.address}</div>}
          {sc.phone && <div>Tél. {sc.phone}</div>}
        </div>
      </div>
      <div style={{ position: "absolute", top: 118, right: 44, textAlign: "center" }}>
        <div style={{ padding: 8, background: "#fff", border: `1px solid ${sc.primary}` }}>
          <QR data={data} size={150} fg={sc.primary} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 44, bottom: 38, width: 300 }}>
        <div style={{ height: 60, borderBottom: "1.5px solid #6b7280" }} />
        <div style={{ fontSize: 17, fontStyle: "italic", color: "#6b7280", marginTop: 6 }}>Signature du titulaire</div>
        <div style={{ fontSize: 15, color: sc.primary, marginTop: 2 }}>{signatoryLabel(sc)}</div>
      </div>
      <div style={{ position: "absolute", right: 44, bottom: 30 }}>
        <Seal text={initials(sc.name)} color={sc.secondary} />
      </div>
    </div>
  );
}
