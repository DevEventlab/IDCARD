/**
 * Rosace de guilloché : le motif des papiers sécurisés (billets, diplômes, pièces d'identité).
 * Purement décoratif, très léger (ellipses SVG), la couleur vient de `currentColor`.
 */
export default function Guilloche({ className = "" }: { className?: string }) {
  const rings = Array.from({ length: 48 }, (_, i) => i);
  return (
    <svg
      viewBox="-200 -200 400 400"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
      aria-hidden="true"
    >
      <circle r="196" />
      {rings.map((i) => (
        <ellipse key={`a${i}`} rx="190" ry="70" transform={`rotate(${i * 3.75})`} />
      ))}
      {rings.map((i) => (
        <ellipse key={`b${i}`} rx="115" ry="42" transform={`rotate(${i * 3.75 + 1.875})`} />
      ))}
      <circle r="30" />
    </svg>
  );
}
