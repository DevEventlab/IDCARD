import { LANDSCAPE, type CardProps } from "@/lib/card-types";
import { Field, Logo, Photo, QR, SANS, birthLine, bornLabel, cardFontFamily, headerFontSize, officialHeader, reverseMessage, signatoryLabel } from "./shared";

const { w, h } = LANDSCAPE;

export default function Classique({ data, side }: CardProps) {
  const { school: sc, student: st } = data;
  const root: React.CSSProperties = { width: w, height: h, position: "relative", overflow: "hidden", background: "#fff", fontFamily: cardFontFamily(sc, SANS), borderRadius: 26 };

  if (side === "front") {
    return (
      <div style={root}>
        <div style={{ height: 116, background: `linear-gradient(112deg, ${sc.primary}, #111713)`, display: "flex", alignItems: "center", gap: 20, padding: "0 42px", borderBottom: `6px solid ${sc.secondary}` }}>
          <Logo school={sc} size={68} />
          <div style={{ minWidth: 0, color: "#fff" }}>
            <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.15 }}>{sc.name}</div>
            {officialHeader(sc) && <div style={{ fontSize: headerFontSize(sc, 17), opacity: 0.82, marginTop: 5, lineHeight: 1.2 }}>{officialHeader(sc)}</div>}
          </div>
        </div>
        <div style={{ position: "absolute", left: 42, top: 142, width: 230, height: 304, padding: 5, boxSizing: "border-box", borderRadius: 18, background: "#fff", boxShadow: "0 12px 28px rgba(15,23,42,.16)" }}>
          <Photo src={st.photoUrl} width={220} height={294} radius={13} tint="#e9edf3" />
        </div>
        <div style={{ position: "absolute", left: 306, top: 145, right: 42 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2.2, color: sc.secondary, textTransform: "uppercase" }}>Carte d&apos;identité scolaire</div>
          <div style={{ fontSize: 43, fontWeight: 800, color: sc.primary, lineHeight: 1.08, textTransform: "uppercase", marginTop: 9 }}>{st.nom}</div>
          <div style={{ fontSize: 30, color: "#334155", marginTop: 4, lineHeight: 1.15 }}>{st.prenoms}</div>
          <div style={{ height: 2, width: 74, background: sc.secondary, margin: "18px 0 18px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ borderRadius: 12, background: "#f1f5f9", padding: "11px 14px" }}>
              <Field label="Classe" value={st.classe} size={24} labelSize={14} />
            </div>
            <div style={{ borderRadius: 12, background: "#f1f5f9", padding: "11px 14px" }}>
              <Field label="Matricule" value={st.matricule} size={23} labelSize={14} />
            </div>
            <div style={{ gridColumn: "1 / span 2", borderRadius: 12, background: "#f8fafc", padding: "11px 14px" }}>
              <Field label={bornLabel(data)} value={birthLine(data)} size={21} labelSize={14} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 54, background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 42px", color: "#475569", fontSize: 17, fontWeight: 600 }}>
          <span style={{ color: sc.primary }}>ÉLÈVE</span>
          <span>Année scolaire {st.anneeScolaire}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={root}>
      <div style={{ height: 22, background: sc.primary }} />
      <div style={{ padding: "34px 44px 0", display: "flex", gap: 40 }}>
        <div style={{ flex: 1, color: "#1f2937" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: sc.primary }}>Carte d&apos;élève</div>
          <p style={{ fontSize: 21, lineHeight: 1.5, margin: "14px 0 0", maxHeight: 190, overflow: "hidden", whiteSpace: "pre-line" }}>
            {reverseMessage(sc, `Cette carte appartient à ${sc.name}. Si vous la trouvez, merci de la rapporter à l'adresse ci-dessous.`)}
          </p>
          <div style={{ marginTop: 22, fontSize: 21, lineHeight: 1.5 }}>
            {sc.address && <div>{sc.address}</div>}
            {sc.phone && <div>Tél. {sc.phone}</div>}
            {st.telephoneParent && <div style={{ marginTop: 10 }}>Contact des parents : {st.telephoneParent}</div>}
          </div>
        </div>
        <div style={{ width: 190, textAlign: "center" }}>
          <QR data={data} size={170} fg={sc.primary} />
          <div style={{ fontSize: 17, color: "#6b7280", marginTop: 10 }}>Scanner pour vérifier</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 44, right: 44, bottom: 40, display: "flex", justifyContent: "space-between", gap: 40 }}>
        {["Signature du titulaire", signatoryLabel(sc)].map((t) => (
          <div key={t} style={{ flex: 1 }}>
            <div style={{ height: 70, borderBottom: "2px solid #9ca3af" }} />
            <div style={{ fontSize: 17, color: "#6b7280", marginTop: 6 }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
