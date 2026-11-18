import { PORTRAIT, type CardProps } from "@/lib/card-types";
import { Logo, Photo, QR, SANS, birthLine, bornLabel, cardFontFamily, headerFontSize, levelColor, officialHeader, reverseMessage, signatoryLabel } from "./shared";

const { w, h } = PORTRAIT;

export default function Colore({ data, side }: CardProps) {
  const { school: sc, student: st } = data;
  const tone = levelColor(st.classe);
  const root: React.CSSProperties = {
    width: w, height: h, position: "relative", overflow: "hidden", fontFamily: cardFontFamily(sc, SANS),
    borderRadius: 26, background: "#fff", color: "#111713",
  };

  if (side === "front") {
    return (
      <div style={root}>
        <div style={{ position: "absolute", inset: "0 0 auto", height: 424, background: `linear-gradient(155deg, ${tone}, #111713)` }} />
        <div style={{ position: "absolute", top: -86, right: -96, width: 310, height: 310, borderRadius: "50%", background: sc.secondary, opacity: 0.35 }} />
        <div style={{ position: "absolute", top: 34, left: 36, right: 36, display: "flex", alignItems: "center", gap: 14, color: "#fff" }}>
          <Logo school={sc} size={54} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{sc.name}</div>
            {officialHeader(sc) && <div style={{ fontSize: headerFontSize(sc, 12), lineHeight: 1.2, marginTop: 4, color: "rgba(255,255,255,.82)" }}>{officialHeader(sc)}</div>}
          </div>
        </div>
        <div style={{ position: "absolute", top: 122, left: 38, fontSize: 13, fontWeight: 700, letterSpacing: 2.5, color: "rgba(255,255,255,.78)" }}>ÉNERGIE · COULEUR · IDENTITÉ</div>
        <div style={{ position: "absolute", top: 166, left: 129, width: 282, height: 296, padding: 8, boxSizing: "border-box", borderRadius: 24, background: "#fff", boxShadow: "0 18px 40px rgba(15,23,42,.22)" }}>
          <Photo src={st.photoUrl} width={266} height={280} radius={17} tint="#e8edf4" />
        </div>
        <div style={{ position: "absolute", top: 490, left: 34, right: 34, textAlign: "center" }}>
          <div style={{ fontSize: 31, fontWeight: 500, color: "#64748b", lineHeight: 1.15 }}>{st.prenoms}</div>
          <div style={{ fontSize: 39, fontWeight: 800, textTransform: "uppercase", lineHeight: 1.08, marginTop: 3 }}>{st.nom}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 15, padding: "8px 22px", borderRadius: 999, background: tone, color: "#fff", fontSize: 18, fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc.secondary }} />
            Classe {st.classe}
          </div>
        </div>
        <div style={{ position: "absolute", top: 638, left: 42, right: 42, height: 1, background: "#e2e8f0" }} />
        <div style={{ position: "absolute", top: 662, left: 42, right: 42, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>MATRICULE</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 5 }}>{st.matricule}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{bornLabel(data).toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 5 }}>{birthLine(data)}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 42, bottom: 28, fontSize: 15, fontWeight: 700, color: tone }}>{st.anneeScolaire}</div>
        <div style={{ position: "absolute", right: 42, bottom: 22, padding: 6, borderRadius: 10, background: "#f1f5f9" }}>
          <QR data={data} size={70} fg={tone} />
        </div>
      </div>
    );
  }

  return (
    <div style={root}>
      <div style={{ height: 168, background: `linear-gradient(135deg, ${tone}, #111713)`, display: "flex", alignItems: "center", gap: 18, padding: "0 42px", color: "#fff" }}>
        <Logo school={sc} size={62} />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{sc.name}</div>
          <div style={{ fontSize: 14, color: sc.secondary, letterSpacing: 2, marginTop: 5 }}>CARTE PERSONNELLE</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 220, left: 42, right: 42, display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: tone }}>EN CAS DE PERTE</div>
          <p style={{ fontSize: 20, lineHeight: 1.5, color: "#475569", margin: "12px 0 0", maxHeight: 170, overflow: "hidden", whiteSpace: "pre-line" }}>
            {reverseMessage(sc, `Cette carte appartient à ${st.prenoms} ${st.nom}. Merci de la rapporter à l'établissement.`)}
          </p>
          <div style={{ fontSize: 17, lineHeight: 1.55, color: "#64748b", marginTop: 16 }}>
            {sc.address && <div>{sc.address}</div>}
            {sc.phone && <div>Tél. {sc.phone}</div>}
            {st.telephoneParent && <div>Parents : {st.telephoneParent}</div>}
          </div>
        </div>
        <div style={{ padding: 10, borderRadius: 14, background: "#f1f5f9" }}>
          <QR data={data} size={148} fg={tone} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 42, right: 42, bottom: 42 }}>
        <div style={{ height: 48, borderBottom: "1.5px solid #94a3b8" }} />
        <div style={{ fontSize: 15, color: "#64748b", marginTop: 7 }}>Signature du titulaire · {signatoryLabel(sc)}</div>
      </div>
    </div>
  );
}
