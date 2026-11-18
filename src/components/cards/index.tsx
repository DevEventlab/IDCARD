import { LANDSCAPE, PORTRAIT, type CardProps } from "@/lib/card-types";
import { Badge, Moderne, Numerique, Officiel } from "./ReferenceTemplates";

export type TemplateId = "officiel" | "numerique" | "geometrique" | "badge";

export type TemplateDef = {
  id: TemplateId;
  name: string;
  description: string;
  orientation: "landscape" | "portrait";
  size: { readonly w: number; readonly h: number };
  Component: (p: CardProps) => React.ReactElement;
};

export const TEMPLATES: TemplateDef[] = [
  { id: "officiel", name: "Officiel ministériel", description: "Armoiries, tricolore, signature de l’apprenant et matricule", orientation: "landscape", size: LANDSCAPE, Component: Officiel },
  { id: "numerique", name: "Numérique QR Code", description: "Fond ivoire, QR code de vérification et identifiant numérique", orientation: "landscape", size: LANDSCAPE, Component: Numerique },
  { id: "geometrique", name: "Moderne géométrique", description: "Bandeaux obliques, portrait et signature du directeur", orientation: "landscape", size: LANDSCAPE, Component: Moderne },
  { id: "badge", name: "Badge vertical à lanière", description: "Format portrait, attache de lanière et photo hexagonale", orientation: "portrait", size: PORTRAIT, Component: Badge },
];

const LEGACY_TEMPLATE_MAP: Record<string, TemplateId> = {
  classique: "officiel",
  premium: "numerique",
  minimal: "geometrique",
  institutionnel: "officiel",
  moderne: "badge",
  colore: "badge",
};

export function getTemplate(id: string): TemplateDef {
  const normalizedId = LEGACY_TEMPLATE_MAP[id] ?? id;
  return TEMPLATES.find((template) => template.id === normalizedId) ?? TEMPLATES[0];
}
