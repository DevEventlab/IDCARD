import { PORTRAIT, type CardProps } from "@/lib/card-types";
import { Logo, Photo, QR, SANS, birthLine, bornLabel, cardFontFamily, headerFontSize, officialHeader, reverseMessage, signatoryLabel } from "./shared";

const { w, h } = PORTRAIT;

export default function Moderne({ data, side }: CardProps) {
  const { school: sc, student: st } = data;
  const root: React.CSSProperties = {
    width: w, height: h, position: "relative", overflow: "hidden", background: "#f8fafc",
    fontFamily: cardFontFamily(sc, SANS), borderRadius: 26, color: "#111713",
  };

  if (side === "front") {
    return (
      <div style={root}>
        <div style={{ position: "absolute", inset: "0 0 auto", height: 310, background: `linear-gradient(145deg, ${sc.primary}, #111713)` }} />
        <div style={{ position: "absolute", top: 0, right: -100, width: 360, height: 360, borderRadius: "50%", border: `1px solid ${sc.secondary}`, opacity: 0.45 }} />
        <div style={{ position: "absolute", top: 36, left: 38, right: 38, display: "flex", alignItems: "center", gap: 14, color: "#fff" }}>
          <Logo school={sc} size={54} ring="rgba(255,255,255,.8)" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{sc.name}</div>
            {officialHeader(sc) && <div style={{ fontSize: headerFontSize(sc, 14), color: "rgba(255,255,255,.76)", marginTop: 5, lineHeight: 1.2 }}>{officialHeader(sc)}</div>}
          </div>
        </div>
        <div style={{ position: "absolute", top: 125, left: 38, fontSize: 13, fontWeight: 700, letterSpacing: 2.5, color: sc.secondary }}>CARTE D&apos;ÉLÈVE</div>
        <div style={{ position: "absolute", top: 174, left: 144, width: 252, height: 286, padding: 8, boxSizing: "border-box", borderRadius: 26, background: "#fff", boxShadow: "0 16px 38px rgba(15,23,42,.22)" }}>
          <Photo src={st.photoUrl} width={236} height={270} radius={19} tint="#e8edf4" />
        </div>
        <div style={{ position: "absolute", top: 486, left: 38, right: 38, textAlign: "center" }}>
          <div style={{ fontSize: 31, fontWeight: 600, lineHeight: 1.15, color: "#64748b" }}>{st.prenoms}</div>
          <div style={{ fontSize: 39, fontWeight: 800, lineHeight: 1.1, textTransform: "uppercase", marginTop: 3 }}>{st.nom}</div>
          <div style={{ display: "inline-flex", marginTop: 15, padding: "8px 24px", borderRadius: 999, background: sc.primary, color: "#fff", fontSize: 18, fontWeight: 700 }}>
            Classe {st.classe}
          </div>
        </div>
        <div style={{ position: "absolute", top: 626, left: 42, right: 42, height: 1, background: "#dbe2ea" }} />
        <div style={{ position: "absolute", top: 650, left: 42, right: 42, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 12px" }}>
          <div>
            <div style={{ fontSize: 13, color: "#64748b" }}>MATRICULE</div>
            <div style={{ fontSize: 19, fontWeight: 700, marginTop: 5 }}>{st.matricule}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{bornLabel(data).toUpperCase()}</div>
            <div style={{ fontSize: 19, fontWeight: 700, marginTop: 5 }}>{birthLine(data)}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 42, bottom: 30, fontSize: 15, fontWeight: 700, color: sc.primary }}>{st.anneeScolaire}</div>
        <div style={{ position: "absolute", right: 42, bottom: 24, padding: 6, background: "#fff", borderRadius: 10, boxShadow: "0 3px 12px rgba(15,23,42,.1)" }}>
          <QR data={data} size={72} fg={sc.primary} />
        </div>
      </div>
    );
  }

  return (
    <div style={root}>
      <div style={{ height: 154, background: `linear-gradient(145deg, ${sc.primary}, #111713)`, display: "flex", alignItems: "center", gap: 18, padding: "0 42px", color: "#fff" }}>
        <Logo school={sc} size={62} />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{sc.name}</div>
          <div style={{ fontSize: 14, letterSpacing: 2, color: sc.secondary, marginTop: 6 }}>VÉRIFICATION D&apos;IDENTITÉ</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 198, left: 42, right: 42, display: "flex", alignItems: "center", gap: 34 }}>
        <div style={{ padding: 12, borderRadius: 18, background: "#fff", boxShadow: "0 8px 24px rgba(15,23,42,.1)" }}>
          <QR data={data} size={170} fg={sc.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: sc.primary }}>CARTE PERSONNELLE</div>
          <p style={{ fontSize: 20, lineHeight: 1.5, color: "#475569", margin: "14px 0 0", maxHeight: 190, overflow: "hidden", whiteSpace: "pre-line" }}>
            {reverseMessage(sc, `Cette carte appartient à ${st.prenoms} ${st.nom}. Merci de la rapporter à l'établissement en cas de perte.`)}
          </p>
        </div>
      </div>
      <div style={{ position: "absolute", top: 440, left: 42, right: 42, borderTop: "1px solid #dbe2ea", paddingTop: 22, fontSize: 18, lineHeight: 1.6, color: "#475569" }}>
        {sc.address && <div>{sc.address}</div>}
        {sc.phone && <div>Tél. {sc.phone}</div>}
        {st.telephoneParent && <div>Contact parent : {st.telephoneParent}</div>}
      </div>
      <div style={{ position: "absolute", left: 42, right: 42, bottom: 42 }}>
        <div style={{ height: 50, borderBottom: "1.5px solid #94a3b8" }} />
        <div style={{ fontSize: 15, color: "#64748b", marginTop: 8 }}>Signature du titulaire · {signatoryLabel(sc)}</div>
      </div>
    </div>
  );
}
