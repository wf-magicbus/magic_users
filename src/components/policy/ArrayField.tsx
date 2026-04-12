"use client";

import { useState } from "react";

interface ArrayFieldProps {
  label: string;
  values: string[];
  onChange?: (values: string[]) => void;
  readOnly?: boolean;
}

export default function ArrayField({ label, values, onChange, readOnly = true }: ArrayFieldProps) {
  const [input, setInput] = useState("");

  const addValue = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange?.([...values, trimmed]);
      setInput("");
    }
  };

  const removeValue = (val: string) => onChange?.(values.filter((v) => v !== val));

  return (
    <div className="py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="text-sm mb-2" style={{ color: "var(--text-2)" }}>{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {values.length === 0 && readOnly && (
          <span className="text-xs italic" style={{ color: "var(--text-3)" }}>None configured</span>
        )}
        {values.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ background: "var(--sky-50)", color: "var(--sky-dark)", border: "1px solid var(--sky-100)" }}
          >
            {val}
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeValue(val)}
                className="ml-0.5 transition-opacity hover:opacity-60"
                style={{ color: "var(--sky-dark)" }}
              >
                <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
                  <path d="M4.646 4.646a.5.5 0 01.708 0L6 5.293l.646-.647a.5.5 0 11.708.708L6.707 6l.647.646a.5.5 0 11-.708.708L6 6.707l-.646.647a.5.5 0 11-.708-.708L5.293 6l-.647-.646a.5.5 0 010-.708z" />
                </svg>
              </button>
            )}
          </span>
        ))}
        {!readOnly && (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addValue())}
              placeholder="Add group…"
              className="w-36 px-3 py-1 text-xs rounded-full border-2 border-yellow-300 bg-yellow-50 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500"
            />
            <button
              type="button"
              onClick={addValue}
              className="w-5 h-5 text-white rounded-full flex items-center justify-center transition-colors"
              style={{ background: "var(--crimson)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson-dark)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson)"}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
