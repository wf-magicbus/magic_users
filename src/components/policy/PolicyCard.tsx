"use client";

interface PolicyCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  editing?: boolean;
  saving?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function PolicyCard({
  title,
  description,
  children,
  editing = false,
  saving = false,
  onEdit,
  onSave,
  onCancel,
}: PolicyCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{title}</h3>
          {description && <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{description}</p>}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={onCancel}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                style={{ background: "var(--silver-100)", color: "var(--text-2)" }}
                onMouseEnter={e => !saving && ((e.currentTarget as HTMLElement).style.background = "var(--silver)")}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--silver-100)"}
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ background: "var(--crimson)" }}
                onMouseEnter={e => !saving && ((e.currentTarget as HTMLElement).style.background = "var(--crimson-dark)")}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--crimson)"}
              >
                {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          ) : onEdit ? (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
              style={{ background: "var(--sky-50)", color: "var(--sky-dark)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-100)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--sky-50)"}
            >
              Edit
            </button>
          ) : null}
        </div>
      </div>
      <div className="px-6 py-5 space-y-1">{children}</div>
    </div>
  );
}
