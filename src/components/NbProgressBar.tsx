type NbProgressBarProps = {
  value: number;
  label?: string;
  accent?: "lime" | "cyan" | "pink" | "yellow";
};

const accentClass = {
  lime: "bg-lime",
  cyan: "bg-cyan",
  pink: "bg-pink",
  yellow: "bg-yellow",
};

export function NbProgressBar({ value, label, accent = "lime" }: NbProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="min-w-0">
      {label && (
        <div className="flex justify-between items-center mb-1.5 gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider truncate">{label}</span>
          <span className="font-mono text-[10px] uppercase shrink-0">{pct}%</span>
        </div>
      )}
      <div className="nb-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`nb-progress-fill ${accentClass[accent]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
