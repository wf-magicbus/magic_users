"use client";

interface PolicyFieldProps {
  label: string;
  value: string | number;
  type?: "text" | "number" | "select";
  options?: { label: string; value: string }[];
  onChange?: (value: string | number) => void;
  readOnly?: boolean;
  suffix?: string;
}

export default function PolicyField({
  label,
  value,
  type = "text",
  options,
  onChange,
  readOnly = true,
  suffix,
}: PolicyFieldProps) {
  const displayValue =
    type === "select" && options
      ? options.find((o) => o.value === String(value))?.label ?? value
      : value;

  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text-2)" }}>{label}</span>
      {readOnly ? (
        <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
          {displayValue}
          {suffix && <span className="font-normal ml-1" style={{ color: "var(--text-3)" }}>{suffix}</span>}
        </span>
      ) : type === "select" && options ? (
        <select
          value={String(value)}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-w-36 px-3 py-1.5 text-sm rounded-lg border-2 border-yellow-300 bg-yellow-50 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type={type}
            value={value}
            min={type === "number" ? 0 : undefined}
            onChange={(e) => onChange?.(type === "number" ? Number(e.target.value) : e.target.value)}
            className="w-32 px-3 py-1.5 text-sm text-right rounded-lg border-2 border-yellow-300 bg-yellow-50 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500"
          />
          {suffix && <span className="text-xs w-16" style={{ color: "var(--text-3)" }}>{suffix}</span>}
        </div>
      )}
    </div>
  );
}
