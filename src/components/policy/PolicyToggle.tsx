"use client";

interface PolicyToggleProps {
  label: string;
  value: boolean;
  onChange?: (value: boolean) => void;
  readOnly?: boolean;
  description?: string;
}

export default function PolicyToggle({
  label,
  value,
  onChange,
  readOnly = true,
  description,
}: PolicyToggleProps) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="mr-4">
        <div className="text-sm" style={{ color: "var(--text-1)" }}>{label}</div>
        {description && <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{description}</div>}
      </div>
      {readOnly ? (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={value
            ? { background: "#F0FDF4", color: "#15803D" }
            : { background: "var(--silver-50)", color: "var(--text-3)" }
          }
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: value ? "#22C55E" : "var(--silver)" }} />
          {value ? "Enabled" : "Disabled"}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onChange?.(!value)}
          className="relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border-2 border-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
          style={{ background: value ? "#f4c430" : "#cbd5e1" }}
        >
          <span
            className="inline-block rounded-full bg-white border border-gray-300 shadow transition-transform"
            style={{ width: "19px", height: "19px", transform: value ? "translateX(24px)" : "translateX(2px)" }}
          />
        </button>
      )}
    </div>
  );
}
