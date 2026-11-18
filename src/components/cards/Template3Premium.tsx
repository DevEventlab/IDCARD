import { LANDSCAPE, type CardProps } from "@/lib/card-types";
import { Logo, Photo, QR, SERIF, birthLine, bornLabel, cardFontFamily, headerFontSize, officialHeader, reverseMessage, signatoryLabel } from "./shared";

const { w, h } = LANDSCAPE;
const INK = "#111713";

export default function Premium({ data, side }: CardProps) {
  const { school: sc, student: st } = data;
  const gold = sc.secondary;
  const root: React.CSSProperties = {
    width: w, height: h, position: "relative", overflow: "hidden", fontFamily: cardFontFamily(sc, SERIF),
    borderRadius: 26, background: "#f8f6f0", color: INK,
  };

  if (side === "front") {
    return (
      <div style={root}>
        <div style={{ position: "absolute", inset: 0, width: 292, background: `linear-gradient(155deg, ${sc.primary}, #101a2d)` }} />
        <div style={{ position: "absolute", top: 32, left: 34, right: 34, display: "flex", alignItems: "center", gap: 14, color: "#fff" }}>
          <Logo school={sc} size={54} ring={gold} fg={gold} bg="transparent" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{sc.name}</div>
            {officialHeader(sc) && <div style={{ fontSize: headerFontSize(sc, 12), lineHeight: 1.2, marginTop: 4, color: "rgba(255,255,255,.8)" }}>{officialHeader(sc)}</div>}
          </div>
        </div>
        <div style={{ position: "absolute", left: 34, top: 126, width: 224, height: 276, padding: 7, boxSizing: "border-box", border: `1px solid ${gold}`, borderRadius: 4 }}>
          <Photo src={st.photoUrl} width={208} height={260} tint="#25354b" />
        </div>
        <div style={{ position: "absolute", left: 34, bottom: 34, fontSize: 16, letterSpacing: 2, color: gold }}>{st.anneeScolaire}</div>
        <div style={{ position: "absolute", left: 332, right: 38, top: 48 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: sc.primary }}>IDENTITÉ SCOLAIRE</div>
          <div style={{ fontSize: 43, lineHeight: 1.08, color: INK, marginTop: 20 }}>{st.prenoms}</div>
          <div style={{ fontSize: 34, letterSpacing: 3, color: sc.primary, marginTop: 5, textTransform: "uppercase" }}>{st.nom}</div>
          <div style={{ width: 74, height: 2, background: gold, margin: "20px 0 22px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 12px" }}>
            <div>
              <div style={{ fontSize: 14, color: "#7c6b50", fontStyle: "italic" }}>Classe</div>
              <div style={{ fontSize: 23, fontWeight: 700, marginTop: 4 }}>{st.classe}</div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: "#7c6b50", fontStyle: "italic" }}>Matricule</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{st.matricule}</div>
            </div>
            <div style={{ gridColumn: "1 / span 2" }}>
              <div style={{ fontSize: 14, color: "#7c6b50", fontStyle: "italic" }}>{bornLabel(data)}</div>
              <div style={{ fontSize: 19, fontWeight: 700, marginTop: 4 }}>{birthLine(data)}</div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 38, bottom: 24, padding: 5, border: `1px solid ${gold}`, background: "#fff" }}>
          <QR data={data} size={62} fg={INK} />
        </div>
      </div>
    );
  }

  return (
    <div style={root}>
      <div style={{ position: "absolute", inset: "14px", border: `1px solid ${gold}`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 16, background: INK }} />
      <div style={{ position: "absolute", top: 54, left: 58, width: 188, height: 188, padding: 10, background: "#fff", border: `1px solid ${gold}` }}>
        <QR data={data} size={168} fg={INK} />
      </div>
      <div style={{ position: "absolute", top: 66, left: 292, right: 70 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#927943" }}>CARTE D&apos;ÉLÈVE · {st.anneeScolaire}</div>
        <div style={{ fontSize: 29, marginTop: 18, color: INK }}>{sc.name}</div>
        <div style={{ fontSize: 16, lineHeight: 1.4, fontStyle: "italic", color: sc.primary, marginTop: 10, maxHeight: 84, overflow: "hidden", whiteSpace: "pre-line" }}>
          {reverseMessage(sc, sc.motto || "Carte personnelle et non cessible.")}
        </div>
        <div style={{ width: 60, height: 1.5, background: gold, margin: "20px 0" }} />
        <div style={{ fontSize: 17, lineHeight: 1.5, color: "#52525b" }}>
          {sc.address && <div>{sc.address}</div>}
          {sc.phone && <div>Tél. {sc.phone}</div>}
        </div>
      </div>
      <div style={{ position: "absolute", left: 58, right: 58, bottom: 42, display: "flex", justifyContent: "space-between", gap: 40 }}>
        {["Signature du titulaire", signatoryLabel(sc)].map((label) => (
          <div key={label} style={{ width: 260 }}>
            <div style={{ height: 42, borderBottom: "1px solid #9ca3af" }} />
            <div style={{ fontSize: 14, color: "#71717a", marginTop: 7 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
