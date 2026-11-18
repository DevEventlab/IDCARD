export type CardSchool = {
  name: string;
  authority?: string; // ex. « Établissement privé agréé »
  motto?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  cardHeader?: string;
  cardBackText?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  cardFont?: "template" | "sans" | "serif";
  cardHeaderSize?: number;
  primary: string; // couleur principale
  secondary: string; // couleur d'accent
};

export type CardStudent = {
  matricule: string;
  nom: string;
  prenoms: string;
  dateNaissance: string; // déjà formatée JJ/MM/AAAA
  lieuNaissance?: string;
  sexe: "M" | "F";
  classe: string;
  anneeScolaire: string;
  photoUrl?: string;
  telephoneParent?: string;
  parentName?: string;
  emergencyContact?: string;
  nationalite?: string;
  shortId?: string;
};

export type CardData = {
  school: CardSchool;
  student: CardStudent;
  verifyUrl?: string; // contenu du QR code (sinon : matricule)
};

export type CardSide = "front" | "back";

export type CardProps = { data: CardData; side: CardSide };

// Dimensions de travail : 10 px = 1 mm (format CR80 : 85,6 × 54 mm)
export const LANDSCAPE = { w: 856, h: 540 } as const;
export const PORTRAIT = { w: 540, h: 856 } as const;
