import PDFDocument from "pdfkit";
import { create as createQrCode } from "qrcode";
import { access } from "node:fs/promises";
import path from "node:path";
import type { CardSchool } from "@/lib/card-types";
import { storagePath } from "@/lib/storage";

type PdfStudent = {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
  sexe: string;
  dateNaissance?: Date | string;
  telephoneParent?: string | null;
  anneeScolaire: string | null;
  photoKey: string | null;
  class: { name: string };
};

const PT_PER_MM = 72 / 25.4;
const toPt = (mm: number) => mm * PT_PER_MM;
const PORTRAIT_TEMPLATES = new Set(["badge", "moderne", "colore"]);

function color(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : "#1F3A5F";
}

function cardDimensions(templateId: string) {
  return PORTRAIT_TEMPLATES.has(templateId)
    ? { width: toPt(54), height: toPt(85.6) }
    : { width: toPt(85.6), height: toPt(54) };
}

function drawPhoto(
  doc: PDFKit.PDFDocument,
  key: string | null,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  doc.save().roundedRect(x, y, width, height, 5).fill("#E8EDF3").restore();
  if (!key) return;
  const file = storagePath(key);
  try {
    // Avoid following arbitrary paths stored in the database.
    const relative = path.relative(storagePath("students"), file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return;
    doc.image(file, x, y, { fit: [width, height], align: "center", valign: "center" });
  } catch {
    // A missing/unreadable portrait falls back to the neutral photo panel.
  }
}

function drawQr(doc: PDFKit.PDFDocument, value: string, x: number, y: number, size: number, ink = "#0F172A") {
  const qrCode = createQrCode(value, { errorCorrectionLevel: "M" });
  const modules = qrCode.modules.size;
  const scale = size / modules;
  const path: string[] = [];
  for (let row = 0; row < modules; row++) {
    for (let column = 0; column < modules; column++) {
      if (qrCode.modules.get(row, column)) path.push(`M${column} ${row}h1v1h-1z`);
    }
  }
  doc.save().translate(x, y).scale(scale, scale);
  doc.rect(0, 0, modules, modules).fill("#FFFFFF");
  doc.path(path.join("")).fill(ink).restore();
}

function drawReferenceCard(
  doc: PDFKit.PDFDocument,
  student: PdfStudent,
  school: CardSchool,
  templateId: string,
  side: "front" | "back",
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const p = school.primary;
  const a = school.secondary;
  const portrait = templateId === "badge";
  const birthDate = student.dateNaissance instanceof Date
    ? student.dateNaissance.toLocaleDateString("fr-FR", { timeZone: "UTC" })
    : student.dateNaissance ?? "";
  const shortId = `SC-${student.anneeScolaire?.slice(0, 4) ?? "2026"}-${student.matricule.slice(-4)}`;
  doc.save();
  doc.roundedRect(x, y, width, height, 6).fill(templateId === "numerique" ? "#F4F1EA" : "#FFFFFF");
  doc.roundedRect(x, y, width, height, 6).lineWidth(.7).stroke("#CBD5E1");
  if (templateId === "badge") {
    const header = height * .34;
    doc.rect(x, y, width, header).fill(p);
    doc.moveTo(x, y + header * .8).quadraticCurveTo(x + width * .5, y + header * 1.08, x + width, y + header * .82).lineTo(x + width, y + header).lineTo(x, y + header).closePath().fill("#FFFFFF");
    if (side === "front") {
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8).text(school.name.toUpperCase(), x + 10, y + 14, { width: width - 20, align: "center", ellipsis: true });
      doc.fontSize(5).text(student.anneeScolaire ?? "", x + 10, y + 28, { width: width - 20, align: "center" });
      const photoSize = width * .3;
      drawPhoto(doc, student.photoKey, x + (width - photoSize) / 2, y + header - 10, photoSize, photoSize * .84);
      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(7).text(`${student.prenoms} ${student.nom}`.toUpperCase(), x + 8, y + header + photoSize * .84 + 2, { width: width - 16, align: "center", ellipsis: true });
      doc.fillColor(p).fontSize(6).text(`Classe : ${student.class.name}`, x + 8, y + height * .62, { width: width - 16, align: "center" });
      doc.fillColor("#334155").font("Helvetica").fontSize(5.5);
      doc.text(`Matricule : ${shortId}`, x + 11, y + height * .72, { width: width - 22, ellipsis: true });
      doc.text(`Né(e) le : ${birthDate}`, x + 11, y + height * .79, { width: width - 22, ellipsis: true });
      doc.text(`Urgence : ${student.telephoneParent ?? ""}`, x + 11, y + height * .86, { width: width - 22, ellipsis: true });
      doc.rect(x, y + height - 6, width, 6).fill(p);
    } else {
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(7).text("VERSO • VÉRIFICATION", x + 7, y + 14, { width: width - 14, align: "center" });
      drawQr(doc, student.matricule, x + (width - height * .27) / 2, y + height * .22, height * .27, p);
      doc.fillColor("#475569").font("Helvetica").fontSize(6).text(`Badge scolaire délivré par ${school.name}.\nMatricule : ${shortId}\nUrgence : ${student.telephoneParent ?? ""}`, x + 12, y + height * .55, { width: width - 24, align: "center", lineGap: 3 });
      doc.rect(x, y + height - 6, width, 6).fill(p);
    }
    doc.restore();
    return;
  }

  if (templateId === "officiel") {
    if (side === "front") {
      doc.fillColor("#173B70").font("Helvetica-Bold").fontSize(6).text("MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE,\nTECHNIQUE ET DE LA FORMATION PROFESSIONNELLE", x + width * .2, y + 10, { width: width * .42, lineGap: 1 });
      doc.fillColor("#0F172A").fontSize(8).text(school.name.toUpperCase(), x + width * .68, y + 16, { width: width * .27, align: "right", ellipsis: true });
      doc.rect(x + width * .2, y + 29, width * .2, 2).fill("#15803D"); doc.rect(x + width * .4, y + 29, width * .1, 2).fill("#FACC15"); doc.rect(x + width * .5, y + 29, width * .1, 2).fill("#E5243B");
      doc.fillColor("#1F2937").fontSize(5).text("RÉPUBLIQUE • FRATERNITÉ • JUSTICE", x + width * .2, y + 33, { width: width * .45 });
      doc.fillColor("#0F172A").fontSize(7).text(`CARTE D’IDENTITÉ SCOLAIRE ${student.anneeScolaire ?? ""}`, x + 12, y + 48, { width: width - 24, align: "center" });
      const photoX = x + 12; const photoY = y + 68; const photoW = width * .2; const photoH = height * .52;
      drawPhoto(doc, student.photoKey, photoX, photoY, photoW, photoH);
      const tx = x + width * .27; const tw = width * .69;
      doc.fillColor("#0F172A").font("Helvetica").fontSize(6.2);
      const details = [["Nom", student.nom.toUpperCase()], ["Prénoms", student.prenoms], ["Né(e) le", birthDate], ["Nationalité", "Béninoise"], ["Contact", student.telephoneParent ?? ""], ["Classe", student.class.name]];
      details.forEach(([label, value], index) => { const yy = photoY + index * 12; doc.font("Helvetica-Bold").text(`${label} :`, tx, yy, { width: 48 }); doc.font("Helvetica").text(value || "—", tx + 50, yy, { width: tw - 50, ellipsis: true }); });
      doc.font("Helvetica-Bold").fontSize(5).text("Signature de l’apprenant :", tx, y + height * .76); doc.rect(tx + width * .2, y + height * .75, width * .13, height * .09).lineWidth(.5).stroke("#06B6D4");
      doc.moveTo(x + 12, y + height - 20).lineTo(x + width - 12, y + height - 20).lineWidth(.5).stroke("#CBD5E1");
      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(6).text(`Mle : ${student.matricule}`, x + 12, y + height - 14);
      doc.rect(x + width - 50, y + height - 14, 12, 2).fill("#15803D"); doc.rect(x + width - 38, y + height - 14, 12, 2).fill("#FACC15"); doc.rect(x + width - 26, y + height - 14, 12, 2).fill("#E5243B");
    } else {
      doc.fillColor("#166534").font("Helvetica-Bold").fontSize(8).text("RÈGLEMENT & VALIDITÉ", x + 16, y + 15);
      doc.fillColor("#475569").font("Helvetica").fontSize(7).text(`Cette carte est strictement personnelle et doit être présentée à toute réquisition de l’administration.\nEn cas de perte, prière de la rapporter au secrétariat de ${school.name}.\nToute falsification expose son auteur aux sanctions disciplinaires prévues.`, x + 16, y + 40, { width: width - 32, height: height * .4, lineGap: 3 });
      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(6).text(`Matricule : ${student.matricule}\nUrgence : ${student.telephoneParent ?? ""}`, x + 16, y + height - 35);
      doc.fillColor("#1E3A8A").font("Times-Italic").fontSize(10).text(school.signatoryName || "Le Directeur", x + width - 100, y + height - 34, { width: 82, align: "center" });
    }
    doc.restore();
    return;
  }

  if (templateId === "numerique") {
    if (side === "front") {
      doc.fillColor("#065F46").font("Helvetica-Bold").fontSize(11).text("SN", x + 13, y + 13);
      doc.rect(x + 37, y + 16, 28, 6).fill("#15803D"); doc.rect(x + 65, y + 16, 28, 6).fill("#FACC15"); doc.rect(x + 93, y + 16, 28, 6).fill("#E5243B");
      doc.fillColor("#334155").fontSize(5).text(school.cardHeader || "MINISTÈRE DE L’ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE ET SECONDAIRE", x + width * .55, y + 13, { width: width * .4, align: "right" });
      doc.moveTo(x + 12, y + 32).lineTo(x + width - 12, y + 32).lineWidth(.5).stroke("#475569");
      doc.fillColor("#1B3B5A").fontSize(8).text("CARTE SCOLAIRE NUMÉRIQUE", x + 12, y + 39, { width: width - 24, align: "center" });
      doc.moveTo(x + 12, y + 53).lineTo(x + width - 12, y + 53).lineWidth(.5).stroke("#475569");
      const ph = height * .49; drawPhoto(doc, student.photoKey, x + 12, y + 65, width * .23, ph);
      const tx = x + width * .29;
      doc.fillColor("#1B3B5A").font("Helvetica-Bold").fontSize(8).text(`${student.prenoms} ${student.nom}`.toUpperCase(), tx, y + 69, { width: width * .39, ellipsis: true });
      doc.fillColor("#0F172A").fontSize(7).text(`${student.class.name}\n${school.name}\nAnnée scolaire\n${student.anneeScolaire ?? ""}`, tx, y + 84, { width: width * .39, height: 56, lineGap: 2, ellipsis: true });
      drawQr(doc, student.matricule, x + width - height * .29 - 15, y + 76, height * .29);
      doc.moveTo(x + 12, y + height - 20).lineTo(x + width - 12, y + height - 20).lineWidth(.5).stroke("#475569");
      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(6).text(`Portail Éducatif Numérique • Matricule ${shortId}`, x + 12, y + height - 14, { width: width - 24, align: "center", ellipsis: true });
    } else {
      doc.fillColor("#1B3B5A").font("Helvetica-Bold").fontSize(8).text("AUTHENTIFICATION NUMÉRIQUE", x + 12, y + 17, { width: width - 24, align: "center" });
      drawQr(doc, student.matricule, x + 25, y + 45, height * .48);
      doc.fillColor("#334155").font("Helvetica").fontSize(6.5).text(`Scannez le QR Code pour vérifier l’inscription de ${student.prenoms} ${student.nom}.\nID : ${shortId}\nContact urgence : ${student.telephoneParent ?? ""}`, x + width * .38, y + 55, { width: width * .57, lineGap: 3 });
      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(6).text(`Réseau Scolaire Numérique • ${school.name}`, x + 12, y + height - 20, { width: width - 24, align: "center", ellipsis: true });
    }
    doc.restore();
    return;
  }

  // Modèle moderne géométrique : bandeaux diagonaux, portrait et signature.
  if (side === "front") {
    doc.moveTo(x, y).lineTo(x + width * .43, y).lineTo(x + width * .32, y + height * .3).lineTo(x, y + height * .3).closePath().fill(a);
    doc.moveTo(x + width * .43, y).lineTo(x + width, y).lineTo(x + width, y + height * .3).lineTo(x + width * .36, y + height * .3).closePath().fill(p);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(7).text(school.name.toUpperCase(), x + width * .47, y + 12, { width: width * .49, align: "right", ellipsis: true });
    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(5).text(school.motto || `ÉTABLISSEMENT CERTIFIÉ • ${student.anneeScolaire ?? ""}`, x + width * .47, y + 26, { width: width * .49, align: "right", ellipsis: true });
    const photoX = x + 17; const photoY = y + height * .39; const photoW = width * .22; const photoH = height * .4;
    drawPhoto(doc, student.photoKey, photoX, photoY, photoW, photoH);
    doc.fillColor("#0F172A").font("Helvetica").fontSize(6.5);
    const rows = [["Matricule", shortId], ["Élève", `${student.prenoms} ${student.nom}`], ["Parent/Tuteur", "—"], ["Classe", student.class.name], ["Né(e) le", birthDate], ["Urgence", student.telephoneParent ?? ""]];
    rows.forEach(([label, value], index) => { const yy = y + height * .39 + index * 13; doc.font("Helvetica-Bold").text(label, x + width * .29, yy, { width: 70 }); doc.font("Helvetica").text(`: ${value || "—"}`, x + width * .49, yy, { width: width * .47, ellipsis: true }); });
    doc.moveTo(x, y + height * .86).lineTo(x + width * .61, y + height * .86).lineTo(x + width * .67, y + height).lineTo(x, y + height).closePath().fill(p);
    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(5.5).text(`Année scolaire ${student.anneeScolaire ?? ""} • Carte officielle\nTél. Secrétariat : ${school.phone ?? ""}`, x + 13, y + height * .89, { width: width * .56, lineGap: 2 });
    doc.fillColor(p).font("Times-Italic").fontSize(11).text(school.signatoryName || "Signature", x + width * .68, y + height * .88, { width: width * .28, align: "center" });
    doc.fillColor("#475569").font("Helvetica-Bold").fontSize(5).text("LE DIRECTEUR", x + width * .68, y + height * .96, { width: width * .28, align: "center" });
  } else {
    doc.rect(x, y, width, height * .18).fill(p);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(7).text("CONDITIONS D’UTILISATION", x + 12, y + 14, { width: width - 24 });
    doc.fillColor("#475569").font("Helvetica").fontSize(7).text(`Cette carte atteste de l’inscription régulière de l’élève au sein de ${school.name}.\nElle donne accès aux salles de classe et aux services scolaires.`, x + 16, y + 43, { width: width - 32, lineGap: 3 });
    drawQr(doc, student.matricule, x + width - 58, y + height - 58, 40, p);
    doc.fillColor("#334155").fontSize(6).text(`Urgence : ${student.telephoneParent ?? ""}`, x + 16, y + height - 35);
    doc.fillColor(p).font("Times-Italic").fontSize(10).text(school.signatoryName || "Le Directeur", x + 16, y + height - 25);
  }
  doc.restore();
}

function drawCard(
  doc: PDFKit.PDFDocument,
  student: PdfStudent,
  school: CardSchool,
  templateId: string,
  side: "front" | "back",
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (["officiel", "numerique", "geometrique", "badge"].includes(templateId)) {
    drawReferenceCard(doc, student, school, templateId, side, x, y, width, height);
    return;
  }
  const primary = color(school.primary);
  const accent = color(school.secondary);
  const portrait = PORTRAIT_TEMPLATES.has(templateId);
  const serif = school.cardFont === "serif" || (
    school.cardFont === "template" && ["premium", "institutionnel"].includes(templateId)
  );
  const regularFont = serif ? "Times-Roman" : "Helvetica";
  const boldFont = serif ? "Times-Bold" : "Helvetica-Bold";
  const pad = width * 0.065;

  doc.save();
  doc.roundedRect(x, y, width, height, 6).fill("#FFFFFF");
  doc.roundedRect(x, y, width, height, 6).lineWidth(0.7).stroke("#CBD5E1");
  if (side === "front") {
    const headerHeight = portrait ? height * 0.23 : height * 0.24;
    if (templateId === "premium") {
      doc.roundedRect(x, y, width, height, 6).fill("#FBF8F1");
      doc.rect(x, y, width, headerHeight).fill(primary);
      doc.rect(x, y + headerHeight - 2, width, 2).fill(accent);
    } else if (templateId === "minimal") {
      doc.rect(x, y, width * 0.055, height).fill(primary);
      doc.rect(x + width * 0.055, y, width * 0.014, height).fill(accent);
    } else if (templateId === "institutionnel") {
      doc.rect(x, y, width, height * 0.09).fill(primary);
      doc.rect(x, y + height * 0.09, width, 1.5).fill(accent);
      doc.roundedRect(x + 2, y + 2, width - 4, height - 4, 5).lineWidth(0.5).stroke(accent);
    } else {
      doc.rect(x, y, width, headerHeight).fill(primary);
      doc.rect(x, y + headerHeight - 2, width, 2).fill(accent);
    }

    doc.fillColor("#FFFFFF").font(boldFont).fontSize(portrait ? 8 : 9);
    doc.text(school.name, x + pad, y + headerHeight * 0.14, {
      width: width - 2 * pad,
      height: headerHeight * 0.38,
      ellipsis: true,
    });
    const headerText = school.cardHeader?.trim() || school.authority?.trim();
    if (headerText) {
      const headerSize = Math.min(9, Math.max(5.5, (school.cardHeaderSize ?? 16) * 0.4));
      doc.fillColor("#E2E8F0").font(regularFont).fontSize(headerSize);
      doc.text(headerText, x + pad, y + headerHeight * 0.55, {
        width: width - 2 * pad,
        height: headerHeight * 0.36,
        ellipsis: true,
      });
    }

    if (portrait) {
      const photoWidth = width * 0.54;
      const photoHeight = height * 0.34;
      const photoX = x + (width - photoWidth) / 2;
      const photoY = y + headerHeight + height * 0.025;
      drawPhoto(doc, student.photoKey, photoX, photoY, photoWidth, photoHeight);
      doc.fillColor("#64748B").font(regularFont).fontSize(6).text(student.prenoms, x + pad, photoY + photoHeight + height * 0.035, {
        width: width - 2 * pad, align: "center", ellipsis: true,
      });
      doc.fillColor(primary).font(boldFont).fontSize(9).text(student.nom, x + pad, photoY + photoHeight + height * 0.075, {
        width: width - 2 * pad, align: "center", ellipsis: true,
      });
      doc.fillColor(primary).font(boldFont).fontSize(7).text(`Classe ${student.class.name}`, x + pad, height * 0.78 + y, {
        width: width - 2 * pad, align: "center", ellipsis: true,
      });
      doc.fillColor("#334155").font(regularFont).fontSize(6).text(student.matricule, x + pad, height * 0.84 + y, {
        width: width - 2 * pad, align: "center", ellipsis: true,
      });
      doc.fillColor("#64748B").fontSize(5.5).text(student.anneeScolaire ?? "", x + pad, height * 0.91 + y, {
        width: width - 2 * pad, align: "center", ellipsis: true,
      });
    } else {
      const photoX = x + pad;
      const photoY = y + headerHeight + height * 0.07;
      const photoWidth = width * 0.26;
      const photoHeight = height * 0.56;
      drawPhoto(doc, student.photoKey, photoX, photoY, photoWidth, photoHeight);
      const textX = photoX + photoWidth + width * 0.055;
      const textWidth = x + width - pad - textX;
      doc.fillColor(accent).font(boldFont).fontSize(6).text("CARTE D’IDENTITÉ SCOLAIRE", textX, photoY, {
        width: textWidth, ellipsis: true,
      });
      doc.fillColor(primary).font(boldFont).fontSize(11).text(student.nom, textX, photoY + height * 0.075, {
        width: textWidth, ellipsis: true,
      });
      doc.fillColor("#334155").font(regularFont).fontSize(8).text(student.prenoms, textX, photoY + height * 0.18, {
        width: textWidth, ellipsis: true,
      });
      doc.fillColor("#475569").font(boldFont).fontSize(6.5);
      doc.text(`Classe : ${student.class.name}`, textX, photoY + height * 0.32, { width: textWidth, ellipsis: true });
      doc.text(`Matricule : ${student.matricule}`, textX, photoY + height * 0.42, { width: textWidth, ellipsis: true });
      doc.fillColor("#64748B").font(regularFont).fontSize(5.5).text(`Année scolaire ${student.anneeScolaire ?? ""}`, x + pad, y + height * 0.91, {
        width: width - 2 * pad, ellipsis: true,
      });
    }
  } else {
    doc.rect(x, y, width, height * 0.12).fill(primary);
    doc.rect(x, y + height * 0.12, width, 1.5).fill(accent);
    doc.fillColor(primary).font(boldFont).fontSize(portrait ? 8 : 9);
    doc.text(school.name, x + pad, y + height * 0.23, { width: width - 2 * pad, ellipsis: true });
    const message = school.cardBackText?.trim() || `Cette carte appartient à ${student.prenoms} ${student.nom}.`;
    const messageWidth = width - 2 * pad;
    const messageHeight = height * 0.22;
    const messageY = y + height * 0.39;
    let messageSize = portrait ? 7 : 8;
    doc.font(regularFont);
    while (messageSize > 4.5) {
      doc.fontSize(messageSize);
      if (doc.heightOfString(message, { width: messageWidth, lineGap: 1 }) <= messageHeight) break;
      messageSize -= 0.5;
    }
    doc.fillColor("#334155").font(regularFont).fontSize(messageSize);
    doc.text(message, x + pad, messageY, {
      width: messageWidth,
      height: messageHeight,
      lineGap: 1,
      ellipsis: true,
    });
    doc.fillColor("#475569").font(regularFont).fontSize(portrait ? 5.5 : 6);
    let detailsY = y + height * 0.65;
    for (const detail of [school.address, school.phone ? `Tél. ${school.phone}` : ""]) {
      if (!detail) continue;
      doc.text(detail, x + pad, detailsY, { width: width - 2 * pad, height: height * 0.07, ellipsis: true });
      detailsY += height * 0.075;
    }
    doc.fillColor("#64748B").font(regularFont).fontSize(6);
    doc.text(`Matricule : ${student.matricule}`, x + pad, y + height * 0.82, {
      width: width - 2 * pad, ellipsis: true,
    });
    doc.moveTo(x + pad, y + height * 0.9).lineTo(x + width - pad, y + height * 0.9).lineWidth(0.6).stroke("#94A3B8");
    const signatory = [school.signatoryTitle?.trim() || "Le directeur", school.signatoryName?.trim()].filter(Boolean).join(" : ");
    doc.font(regularFont).fontSize(5.5).text(`Signature du titulaire · ${signatory}`, x + pad, y + height * 0.92, { width: width - 2 * pad, ellipsis: true });
  }

  doc.restore();
}

export async function generateCardsPdf({
  students,
  school,
  templateId,
  layout,
}: {
  students: PdfStudent[];
  school: CardSchool;
  templateId: string;
  layout: "single" | "a4-sheet";
}): Promise<Buffer> {
  const { width, height } = cardDimensions(templateId);
  const document = new PDFDocument({
    autoFirstPage: false,
    compress: true,
    info: { Title: `Cartes scolaires — ${school.name}`, Author: "CarteÉcole" },
  });
  const chunks: Buffer[] = [];
  const output = new Promise<Buffer>((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });

  const sides: ("front" | "back")[] = ["front", "back"];
  for (const side of sides) {
    if (layout === "single") {
      for (const student of students) {
        document.addPage({ size: [width, height], margin: 0 });
        drawCard(document, student, school, templateId, side, 0, 0, width, height);
      }
      continue;
    }

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const gap = toPt(4);
    const margin = toPt(10);
    const columns = Math.max(1, Math.floor((pageWidth - margin * 2 + gap) / (width + gap)));
    const rows = Math.max(1, Math.floor((pageHeight - margin * 2 + gap) / (height + gap)));
    const perPage = columns * rows;
    for (let offset = 0; offset < students.length; offset += perPage) {
      document.addPage({ size: "A4", margin: 0 });
      const count = Math.min(perPage, students.length - offset);
      const usedWidth = columns * width + (columns - 1) * gap;
      const left = (pageWidth - usedWidth) / 2;
      const usedHeight = Math.ceil(count / columns) * height + (Math.ceil(count / columns) - 1) * gap;
      const top = (pageHeight - usedHeight) / 2;
      for (let index = 0; index < count; index++) {
        const x = left + (index % columns) * (width + gap);
        const y = top + Math.floor(index / columns) * (height + gap);
        drawCard(document, students[offset + index], school, templateId, side, x, y, width, height);
      }
    }
  }

  document.end();
  return output;
}

export async function hasStoredPhoto(key: string) {
  try {
    await access(storagePath(key));
    return true;
  } catch {
    return false;
  }
}
