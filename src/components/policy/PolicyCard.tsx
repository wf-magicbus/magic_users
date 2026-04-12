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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs mt-0.5 text-gray-600">{description}</p>}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 bg-yellow-400 text-white text-xs font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          ) : onEdit ? (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-lg hover:bg-yellow-100 border border-yellow-200 transition-colors"
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
