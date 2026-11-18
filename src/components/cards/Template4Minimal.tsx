import { LANDSCAPE, type CardProps } from "@/lib/card-types";
import { Logo, Photo, QR, SANS, birthLine, bornLabel, cardFontFamily, headerFontSize, officialHeader, reverseMessage, signatoryLabel } from "./shared";

const { w, h } = LANDSCAPE;

export default function Minimal({ data, side }: CardProps) {
  const { school: sc, student: st } = data;
  const root: React.CSSProperties = {
    width: w, height: h, position: "relative", overflow: "hidden", background: "#fff",
    fontFamily: cardFontFamily(sc, SANS), borderRadius: 26, color: "#111827",
  };

  if (side === "front") {
    return (
      <div style={root}>
        <div style={{ position: "absolute", inset: "0 0 0 auto", width: 282, background: "#f1f5f9" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: sc.primary }} />
        <div style={{ position: "absolute", top: 38, left: 52, display: "flex", alignItems: "center", gap: 12 }}>
          <Logo school={sc} size={42} ring={sc.primary} fg={sc.primary} bg="transparent" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 600, color: "#334155" }}>{sc.name}</div>
            {officialHeader(sc) && <div style={{ fontSize: headerFontSize(sc, 11), lineHeight: 1.15, color: "#64748b", marginTop: 3 }}>{officialHeader(sc)}</div>}
          </div>
        </div>
        <div style={{ position: "absolute", top: 42, right: 48, fontSize: 14, color: "#64748b", letterSpacing: 1 }}>{st.anneeScolaire}</div>
        <div style={{ position: "absolute", left: 54, top: 158, right: 310 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2.5, color: sc.primary }}>ÉLÈVE</div>
          <div style={{ fontSize: 47, fontWeight: 300, lineHeight: 1.03, letterSpacing: -1.5, marginTop: 18 }}>{st.prenoms}</div>
          <div style={{ fontSize: 48, fontWeight: 750, lineHeight: 1.03, letterSpacing: -1.5, color: sc.primary, marginTop: 4 }}>{st.nom}</div>
          <div style={{ width: 52, height: 3, background: sc.secondary, marginTop: 22 }} />
        </div>
        <div style={{ position: "absolute", left: 54, right: 310, bottom: 46, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px" }}>
          <div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>CLASSE</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{st.classe}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>MATRICULE</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{st.matricule}</div>
          </div>
          <div style={{ gridColumn: "1 / span 2" }}>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{bornLabel(data).toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{birthLine(data)}</div>
          </div>
        </div>
        <div style={{ position: "absolute", top: 120, right: 48, width: 208, height: 272, padding: 6, borderRadius: 4, background: "#fff", boxShadow: "0 12px 30px rgba(15,23,42,.12)" }}>
          <Photo src={st.photoUrl} width={196} height={260} radius={2} tint="#e2e8f0" />
        </div>
        <div style={{ position: "absolute", right: 48, bottom: 34, padding: 6, background: "#fff", borderRadius: 8 }}>
          <QR data={data} size={66} fg={sc.primary} />
        </div>
      </div>
    );
  }

  return (
    <div style={root}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 12, bottom: 0, background: sc.primary }} />
      <div style={{ position: "absolute", top: 52, left: 58, right: 58, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: sc.primary }}>INFORMATIONS DE L&apos;ÉTABLISSEMENT</div>
          <div style={{ fontSize: 27, fontWeight: 600, marginTop: 14 }}>{sc.name}</div>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: "#64748b", margin: "12px 0 0", maxHeight: 142, overflow: "hidden", whiteSpace: "pre-line" }}>
            {reverseMessage(sc, "Carte personnelle et non cessible. En cas de perte, merci de la rapporter à l'établissement.")}
          </p>
          <div style={{ fontSize: 17, lineHeight: 1.5, color: "#475569", marginTop: 18 }}>
            {sc.address && <div>{sc.address}</div>}
            {sc.phone && <div>Tél. {sc.phone}</div>}
          </div>
        </div>
        <div style={{ padding: 10, background: "#f1f5f9", borderRadius: 12 }}>
          <QR data={data} size={156} fg={sc.primary} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 58, bottom: 40, width: 280 }}>
        <div style={{ height: 42, borderBottom: "1px solid #cbd5e1" }} />
        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 7 }}>Signature du titulaire · {signatoryLabel(sc)}</div>
      </div>
      <div style={{ position: "absolute", right: 58, bottom: 48, fontSize: 15, color: "#64748b" }}>{st.anneeScolaire}</div>
    </div>
  );
}
