import JSZip from "jszip";
import type { CardStudent } from "@/lib/card-types";

export type ImportFormat = "format1" | "format2";
export type ImportIssue = {
  severity: "error" | "warning";
  file: string;
  row?: number;
  message: string;
};
export type PhotoSuggestion = {
  file: string;
  url: string;
  score: number;
};
export type ParsedRow = CardStudent & {
  id: string;
  photo: boolean;
  sourceFile: string;
  sourceRow: number;
  photoFile?: string;
  photoMatch?: "matricule" | "filename";
  photoMatchedFile?: string;
  photoSuggestions: PhotoSuggestion[];
};
export type ImportResult = {
  rows: ParsedRow[];
  issues: ImportIssue[];
  excludedExamples: number;
  photoFiles: number;
  photoUrls: string[];
  format: ImportFormat;
};
const ALLOWED_PHOTOS = new Set(["jpg", "jpeg", "png"]);
const REQUIRED_COMMON = [
  "matricule",
  "nom",
  "prenoms",
  "date_naissance",
  "sexe",
];
const MAX_WORKBOOK_BYTES = 20 * 1024 * 1024;
const MAX_PHOTO_ARCHIVE_BYTES = 50 * 1024 * 1024;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_PHOTO_SUGGESTIONS = 3;
const MIN_PHOTO_SUGGESTION_SCORE = 0.65;

type PhotoEntry = {
  name: string;
  key: string;
  url: string;
  normalizedName: string;
};

type SheetData = {
  name: string;
  rows: { rowNumber: number; cells: unknown[] }[];
};
function xmlDocument(source: string, label: string): Document {
  const doc = new DOMParser().parseFromString(source, "application/xml");
  if (doc.getElementsByTagName("parsererror").length)
    throw new Error(`XML invalide : ${label}`);
  return doc;
}
function zipPath(target: string): string {
  if (target.startsWith("/")) return target.replace(/^\/+/, "");
  const parts = ["xl"];
  for (const part of target.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}
function allText(element: Element): string {
  return Array.from(element.getElementsByTagName("t"))
    .map((node) => node.textContent ?? "")
    .join("");
}
function excelDate(serial: number): Date {
  return new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000);
}
function dateStyles(stylesXml: string | undefined): Set<number> {
  if (!stylesXml) return new Set();
  const doc = xmlDocument(stylesXml, "styles.xml");
  const builtIns = new Set([
    14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    50, 51, 52, 53, 54, 55, 56, 57, 58,
  ]);
  const custom = new Map<number, string>();
  for (const entry of Array.from(doc.getElementsByTagName("numFmt")))
    custom.set(
      Number(entry.getAttribute("numFmtId")),
      entry.getAttribute("formatCode") ?? "",
    );
  const formats = Array.from(
    doc.getElementsByTagName("cellXfs")[0]?.getElementsByTagName("xf") ?? [],
  );
  return new Set(
    formats.flatMap((xf, index) => {
      const id = Number(xf.getAttribute("numFmtId") ?? 0);
      const code = custom.get(id) ?? "";
      const clean = code.replace(/"[^"]*"|\\.|\[[^\]]*\]/g, "").toLowerCase();
      return builtIns.has(id) ||
        /y{2,4}/.test(clean) ||
        /d{1,2}[/.-]m{1,4}[/.-]d{1,4}/.test(clean) ||
        /d{1,4}[/.-]m{1,4}[/.-]y{2,4}/.test(clean)
        ? [index]
        : [];
    }),
  );
}
function columnIndex(reference: string): number {
  const letters = reference.match(/^[A-Z]+/i)?.[0]?.toUpperCase() ?? "A";
  let value = 0;
  for (const char of letters) value = value * 26 + char.charCodeAt(0) - 64;
  return value - 1;
}
async function loadWorkbook(file: File): Promise<Map<string, SheetData[]>> {
  const zip = await JSZip.loadAsync(file);
  const workbookFile = zip.file("xl/workbook.xml");
  const relationsFile = zip.file("xl/_rels/workbook.xml.rels");
  if (!workbookFile || !relationsFile)
    throw new Error("Ce fichier n’est pas un classeur XLSX.");
  const [workbookXml, relationsXml, sharedXml, stylesXml] = await Promise.all([
    workbookFile.async("text"),
    relationsFile.async("text"),
    zip.file("xl/sharedStrings.xml")?.async("text"),
    zip.file("xl/styles.xml")?.async("text"),
  ]);
  const workbookDoc = xmlDocument(workbookXml, "workbook.xml");
  const relationsDoc = xmlDocument(relationsXml, "workbook.xml.rels");
  const relations = new Map<string, string>();
  for (const relation of Array.from(
    relationsDoc.getElementsByTagName("Relationship"),
  )) {
    relations.set(
      relation.getAttribute("Id") ?? "",
      relation.getAttribute("Target") ?? "",
    );
  }
  const strings = sharedXml
    ? Array.from(
        xmlDocument(sharedXml, "sharedStrings.xml").getElementsByTagName("si"),
      ).map(allText)
    : [];
  const formattedDates = dateStyles(stylesXml);
  const sheets = new Map<string, SheetData[]>();
  for (const sheet of Array.from(workbookDoc.getElementsByTagName("sheet"))) {
    const name = sheet.getAttribute("name") ?? "";
    const relationId =
      sheet.getAttribute("r:id") ?? sheet.getAttribute("id") ?? "";
    const target = relations.get(relationId);
    if (!name || !target) continue;
    const sheetFile = zip.file(zipPath(target));
    if (!sheetFile) continue;
    const sheetDoc = xmlDocument(await sheetFile.async("text"), `${name}.xml`);
    const rows: SheetData["rows"] = [];
    for (const xmlRow of Array.from(sheetDoc.getElementsByTagName("row"))) {
      const rowNumber = Number(xmlRow.getAttribute("r") ?? rows.length + 1);
      const cells: unknown[] = [];
      for (const cell of Array.from(xmlRow.getElementsByTagName("c"))) {
        const index = columnIndex(cell.getAttribute("r") ?? "A");
        const type = cell.getAttribute("t") ?? "n";
        const valueNode = cell.getElementsByTagName("v")[0];
        const raw = valueNode?.textContent ?? "";
        let value: unknown = raw;
        if (type === "s") value = strings[Number(raw)] ?? "";
        else if (type === "inlineStr") value = allText(cell);
        else if (type === "b") value = raw === "1" ? "TRUE" : "FALSE";
        else if (type === "d") value = raw ? new Date(raw) : "";
        else if (type === "n" || !cell.hasAttribute("t")) {
          const style = Number(cell.getAttribute("s") ?? 0);
          const numeric = Number(raw);
          value =
            raw && Number.isFinite(numeric) && formattedDates.has(style)
              ? excelDate(numeric)
              : raw;
        }
        cells[index] = value;
      }
      rows.push({ rowNumber, cells });
    }
    sheets.set(name, [{ name, rows }]);
  }
  return sheets;
}
function text(value: unknown): string {
  if (value instanceof Date)
    return `${String(value.getUTCDate()).padStart(2, "0")}/${String(value.getUTCMonth() + 1).padStart(2, "0")}/${value.getUTCFullYear()}`;
  return String(value ?? "").trim();
}
function normalizePhotoName(value: string) {
  const leaf = value.split(/[\\/]/).pop() ?? value;
  const stem = leaf.replace(/\.(jpg|jpeg|png)$/i, "");
  return stem
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}
function similarityScore(left: string, right: string) {
  if (!left || !right) return 0;
  if (left === right) return 1;
  const maxLength = Math.max(left.length, right.length);
  const maxDistance = Math.floor(
    maxLength * (1 - MIN_PHOTO_SUGGESTION_SCORE),
  );
  if (Math.abs(left.length - right.length) > maxDistance) return 0;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row++) {
    const current = [row];
    let rowMinimum = row;
    for (let column = 1; column <= right.length; column++) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
      rowMinimum = Math.min(rowMinimum, current[column]);
    }
    if (rowMinimum > maxDistance) return 0;
    previous = current;
  }
  return 1 - previous[right.length] / maxLength;
}
function classMetadata(workbook: Map<string, SheetData[]>) {
  const values = workbook.get("Classe")?.[0]?.rows ?? [];
  const find = (key: string) => {
    const row = values.find(
      (record) => text(record.cells[0]).toLowerCase() === key,
    );
    return row ? text(row.cells[1]) : "";
  };
  return { className: find("classe"), schoolYear: find("annee_scolaire") };
}

export async function analyzeStudentFiles(
  files: File[],
  format: ImportFormat,
  photosZip?: File,
  defaultSchoolYear = "2026-2027",
): Promise<ImportResult> {
  const issues: ImportIssue[] = [];
  const rows: ParsedRow[] = [];
  let excludedExamples = 0;
  const seenMatricules = new Set<string>();
  const photoMap = new Map<string, PhotoEntry>();
  const photoEntries: PhotoEntry[] = [];
  const photoNames = new Set<string>();
  const usedPhotoKeys = new Set<string>();
  if (photosZip) {
    if (photosZip.size > MAX_PHOTO_ARCHIVE_BYTES)
      issues.push({
        severity: "error",
        file: photosZip.name,
        message:
          "L’archive dépasse 50 Mo; compressez les portraits avant de recommencer.",
      });
    else
      try {
        const zip = await JSZip.loadAsync(photosZip);
        const entries = Object.values(zip.files).filter(
          (entry) =>
            !entry.dir &&
            !entry.name.startsWith("__MACOSX/") &&
            !entry.name.split("/").some((part) => part.startsWith(".")),
        );
        for (const entry of entries) {
          const name = entry.name.split("/").pop() ?? entry.name;
          const extension = name.split(".").pop()?.toLowerCase() ?? "";
          if (!ALLOWED_PHOTOS.has(extension)) continue;
          const expanded = (
            entry as typeof entry & { _data?: { uncompressedSize?: number } }
          )._data?.uncompressedSize;
          if (expanded !== undefined && expanded > MAX_PHOTO_BYTES) {
            issues.push({
              severity: "error",
              file: name,
              message: "Photo supérieure à 2 Mo; réduisez-la puis recommencez.",
            });
            continue;
          }
          const blob = await entry.async("blob");
          if (blob.size > MAX_PHOTO_BYTES) {
            issues.push({
              severity: "error",
              file: name,
              message: "Photo supérieure à 2 Mo; réduisez-la puis recommencez.",
            });
            continue;
          }
          const key = name.toLocaleLowerCase();
          if (photoMap.has(key)) {
            issues.push({
              severity: "error",
              file: name,
              message: "Deux photos portent le même nom dans l’archive.",
            });
            continue;
          }
          const url = URL.createObjectURL(blob);
          const photoEntry = {
            name,
            key,
            url,
            normalizedName: normalizePhotoName(name),
          };
          photoMap.set(key, photoEntry);
          photoEntries.push(photoEntry);
          photoNames.add(name);
        }
      } catch {
        issues.push({
          severity: "error",
          file: photosZip.name,
          message: "Impossible de lire cette archive ZIP.",
        });
      }
  }
  if (!files.length)
    issues.push({
      severity: "error",
      file: "Import",
      message: "Sélectionnez au moins un fichier Excel.",
    });
  if (format === "format1" && files.length !== 1)
    issues.push({
      severity: "error",
      file: "Import",
      message: "Le format école complète attend un seul classeur.",
    });
  for (const file of files) {
    if (file.size > MAX_WORKBOOK_BYTES) {
      issues.push({
        severity: "error",
        file: file.name,
        message:
          "Le classeur dépasse 20 Mo; vérifiez le fichier Excel ou répartissez les données par classe.",
      });
      continue;
    }
    let workbook: Map<string, SheetData[]>;
    try {
      workbook = await loadWorkbook(file);
    } catch {
      issues.push({
        severity: "error",
        file: file.name,
        message:
          "Le fichier n’est pas un classeur .xlsx lisible; téléchargez à nouveau le modèle officiel.",
      });
      continue;
    }
    if (!workbook.has("Instructions")) {
      issues.push({
        severity: "error",
        file: file.name,
        message:
          "L’onglet « Instructions » du modèle officiel est absent; téléchargez le bon modèle et ne supprimez pas ses onglets.",
      });
      continue;
    }
    const records = workbook.get("Eleves")?.[0]?.rows;
    if (!records?.length) {
      issues.push({
        severity: "error",
        file: file.name,
        message: "Onglet « Eleves » introuvable ou vide.",
      });
      continue;
    }
    const headers =
      records
        .find((record) => record.rowNumber === 1)
        ?.cells.map((cell) => text(cell).toLowerCase()) ?? [];
    const needed =
      format === "format1" ? [...REQUIRED_COMMON, "classe"] : REQUIRED_COMMON;
    const missing = needed.filter((key) => !headers.includes(key));
    if (missing.length) {
      issues.push({
        severity: "error",
        file: file.name,
        row: 1,
        message: `Colonnes obligatoires absentes : ${missing.join(", ")}. Téléchargez le modèle ${format === "format1" ? "école complète" : "par classe"}.`,
      });
      continue;
    }
    if (format === "format2" && !workbook.has("Classe")) {
      issues.push({
        severity: "error",
        file: file.name,
        message:
          "Onglet « Classe » introuvable; utilisez le modèle officiel par classe.",
      });
      continue;
    }
    const metadata =
      format === "format2"
        ? classMetadata(workbook)
        : { className: "", schoolYear: "" };
    if (format === "format2" && !metadata.className) {
      issues.push({
        severity: "error",
        file: file.name,
        message: "Onglet « Classe » : renseignez le nom de classe en B1.",
      });
      continue;
    }
    const indices = Object.fromEntries(
      [
        "matricule",
        "nom",
        "prenoms",
        "date_naissance",
        "lieu_naissance",
        "sexe",
        "classe",
        "annee_scolaire",
        "photo",
        "telephone_parent",
      ].map((key) => [key, headers.indexOf(key)]),
    ) as Record<string, number>;
    const dataRows = records.filter(
      (record) =>
        record.rowNumber > 1 && record.cells.some((cell) => text(cell)),
    );
    if (dataRows.length > 1000)
      issues.push({
        severity: "warning",
        file: file.name,
        message: "Le modèle prévoit jusqu’à 1 000 élèves par classeur.",
      });
    for (const record of dataRows) {
      const source = record.cells;
      const get = (key: string) =>
        indices[key] >= 0 ? text(source[indices[key]]) : "";
      const matricule = get("matricule"),
        nom = get("nom"),
        prenoms = get("prenoms"),
        dateText = get("date_naissance");
      const classe = get("classe") || metadata.className;
      if (
        ![matricule, nom, prenoms, dateText, get("sexe"), classe].some(Boolean)
      )
        continue;
      if (matricule.toUpperCase().startsWith("EX-")) {
        excludedExamples++;
        continue;
      }
      const report = (
        message: string,
        severity: "error" | "warning" = "error",
      ) =>
        issues.push({
          severity,
          file: file.name,
          row: record.rowNumber,
          message,
        });
      let rowHasError = false;
      if (!matricule) {
        report("Matricule obligatoire.");
        rowHasError = true;
      }
      if (!nom) {
        report("Nom obligatoire.");
        rowHasError = true;
      }
      if (!prenoms) {
        report("Prénoms obligatoires.");
        rowHasError = true;
      }
      const birth = parseDate(dateText);
      if (!birth) {
        report(
          "Date de naissance invalide; utilisez JJ/MM/AAAA (ex. 14/03/2014). Champ obligatoire dans le modèle.",
        );
        rowHasError = true;
      }
      const genderRaw = get("sexe").trim().toUpperCase();
      const gender = genderRaw.startsWith("F")
        ? "F"
        : genderRaw.startsWith("M")
          ? "M"
          : "";
      if (!gender) {
        report("Sexe invalide; renseignez F ou M, conformément au modèle.");
        rowHasError = true;
      }
      if (!classe) {
        report("Classe obligatoire dans le format choisi.");
        rowHasError = true;
      }
      const duplicateKey = matricule.toLocaleLowerCase();
      if (matricule && seenMatricules.has(duplicateKey)) {
        report(`Matricule « ${matricule} » en doublon dans ce lot.`);
        rowHasError = true;
      }
      if (matricule) seenMatricules.add(duplicateKey);
      const importedYear = get("annee_scolaire") || metadata.schoolYear;
      if (!importedYear)
        report(
          `Année scolaire absente; la valeur par défaut de l’école (${defaultSchoolYear}) sera appliquée.`,
          "warning",
        );
      const photoReference = get("photo");
      const photoFile = photoReference || (matricule ? `${matricule}.jpg` : "");
      const leaf = photoFile.split(/[\\/]/).pop() ?? "";
      let matchedEntry = leaf ? photoMap.get(leaf.toLocaleLowerCase()) : undefined;
      if (!matchedEntry && leaf) {
        const normalizedReference = normalizePhotoName(leaf);
        const sameName = photoEntries.filter(
          (entry) => entry.normalizedName === normalizedReference,
        );
        if (sameName.length === 1) matchedEntry = sameName[0];
      }
      const photoMatch = matchedEntry ? (photoReference ? "filename" : "matricule") : undefined;
      let photoUrl = matchedEntry?.url;
      if (matchedEntry && usedPhotoKeys.has(matchedEntry.key)) {
        report(
          `La photo « ${matchedEntry.name} » est déjà associée à un autre élève.`,
          "warning",
        );
        photoUrl = undefined;
      } else if (matchedEntry && !rowHasError) {
        usedPhotoKeys.add(matchedEntry.key);
      }
      if (!rowHasError)
        rows.push({
          id: `import-${file.name}-${matricule}`,
          matricule,
          nom: nom.toLocaleUpperCase("fr-FR"),
          prenoms,
          dateNaissance: birth!,
          lieuNaissance: get("lieu_naissance") || undefined,
          sexe: gender as "F" | "M",
          classe,
          anneeScolaire: importedYear || defaultSchoolYear,
          telephoneParent: get("telephone_parent") || undefined,
          photo: Boolean(photoUrl),
          photoUrl,
          sourceFile: file.name,
          sourceRow: record.rowNumber,
          photoFile,
          photoMatch: photoUrl ? photoMatch : undefined,
          photoMatchedFile: photoUrl ? matchedEntry?.name : undefined,
          photoSuggestions: [],
        });
    }
  }
  for (const row of rows) {
    if (row.photoUrl) continue;
    const aliases = [
      normalizePhotoName(row.matricule),
      normalizePhotoName(row.nom),
      normalizePhotoName(row.prenoms),
      normalizePhotoName(`${row.nom} ${row.prenoms}`),
      normalizePhotoName(`${row.prenoms} ${row.nom}`),
      normalizePhotoName(row.photoFile ?? ""),
    ].filter(Boolean);
    row.photoSuggestions = photoEntries
      .filter((entry) => !usedPhotoKeys.has(entry.key))
      .map((entry) => ({
        file: entry.name,
        url: entry.url,
        score: Math.max(
          ...aliases.map((alias) =>
            similarityScore(alias, entry.normalizedName),
          ),
        ),
      }))
      .filter((suggestion) => suggestion.score >= MIN_PHOTO_SUGGESTION_SCORE)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_PHOTO_SUGGESTIONS);
    issues.push({
      severity: "warning",
      file: row.sourceFile,
      row: row.sourceRow,
      message: row.photoSuggestions.length
        ? `Aucune correspondance exacte pour « ${row.photoFile || row.matricule} ». Vérifiez et confirmez une suggestion avant l’import.`
        : `Aucune photo associée à ${row.prenoms} ${row.nom}; un avatar sera utilisé.`,
    });
  }
  const matched = new Set(usedPhotoKeys);
  const suggested = new Set(
    rows.flatMap((row) => row.photoSuggestions.map((photo) => photo.file.toLocaleLowerCase())),
  );
  for (const name of photoNames) {
    const key = name.toLocaleLowerCase();
    if (!matched.has(key) && !suggested.has(key))
      issues.push({
        severity: "warning",
        file: name,
        message:
          "Photo présente dans le ZIP mais non référencée par une ligne valide.",
      });
  }
  return {
    rows,
    issues,
    excludedExamples,
    photoFiles: photoNames.size,
    photoUrls: photoEntries.map((entry) => entry.url),
    format,
  };
}

function parseDate(value: string): string | null {
  if (!value) return null;
  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const local = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  const parts = iso
    ? [Number(iso[3]), Number(iso[2]), Number(iso[1])]
    : local
      ? [Number(local[1]), Number(local[2]), Number(local[3])]
      : null;
  if (!parts) return null;
  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}
