import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg border border-[#d8dee7] bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-[#d8dee7] px-5 py-4">
          <div className={`rounded-full p-2 ${danger ? 'bg-[#fee2e2] text-[#dc2626]' : 'bg-[#dbeafe] text-[#2563eb]'}`}>
            <AlertTriangle size={18} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-[#111827]">{title}</h2>
            <p className="mt-1 text-sm text-[#64748b]">{message}</p>
          </div>
          <button className="focus-ring rounded-md p-1 text-[#64748b] hover:bg-[#f1f5f9]" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-end gap-3 px-5 py-4">
          <button className="btn btn-secondary focus-ring" onClick={onClose}>
            Cancel
          </button>
          <button className={`btn focus-ring ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
