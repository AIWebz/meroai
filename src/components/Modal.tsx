import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[17px] font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-ink-faint hover:bg-paper-dim" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
