"use client";

import { useEffect, type ReactNode } from "react";
import CloseIcon from '@mui/icons-material/Close';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Dialog({ open, onClose, title, children }: DialogProps) {
  // Lock background scrolling while the dialog is open. The page's scroll
  // container is <main> (html/body are pinned to the viewport height), so we
  // lock that and the body for good measure, restoring both on close.
  useEffect(() => {
    if (!open) return;

    const main = document.querySelector("main");
    const previous = {
      body: document.body.style.overflow,
      main: main?.style.overflow,
    };

    document.body.style.overflow = "hidden";
    if (main) main.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous.body;
      if (main) main.style.overflow = previous.main ?? "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/15 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="dialog-title"
            className="text-xl font-semibold text-black dark:text-zinc-50"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-black hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 dark:text-zinc-50 dark:hover:bg-white/10 dark:focus-visible:ring-white/40"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
      </div>
    </div>
  );
}
