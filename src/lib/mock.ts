import type { CardData } from "./card-types";

export const MOCK_DATA: CardData = {
  school: {
    name: "Collège Saint-Exupéry",
    authority: "Établissement privé agréé",
    motto: "Savoir, rigueur, avenir",
    address: "Rue des Écoles, BP 1234",
    phone: "+229 01 00 00 00 00",
    primary: "#1F3A5F",
    secondary: "#C9A24B",
  },
  student: {
    matricule: "2026-0001",
    nom: "Agbodji",
    prenoms: "Marie Claire",
    dateNaissance: "14/03/2014",
    lieuNaissance: "Cotonou",
    sexe: "F",
    classe: "6eA",
    anneeScolaire: "2026-2027",
    telephoneParent: "+229 01 00 00 00 01",
  },
  verifyUrl: "https://cartes.exemple.com/v/2026-0001",
};
