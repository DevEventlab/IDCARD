export default function Field({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold">{label}</span>
      <input {...props} className="input" />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
