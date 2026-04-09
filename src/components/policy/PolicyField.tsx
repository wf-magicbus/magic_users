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
          className="px-3 py-1.5 text-sm rounded-xl border"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-1)",
            outline: "none",
          }}
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
            className="w-28 px-3 py-1.5 text-sm text-right rounded-xl border"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-1)",
              outline: "none",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--crimson)")}
            onBlur={e => (e.target.style.borderColor = "var(--border-strong)")}
          />
          {suffix && <span className="text-xs w-16" style={{ color: "var(--text-3)" }}>{suffix}</span>}
        </div>
      )}
    </div>
  );
}
