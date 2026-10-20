"use client";

/** Opens the browser's print dialog (also "Save as PDF" on most phones). */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-11 rounded-md border-2 border-ink px-4 py-2 font-bold hover:bg-surface print:hidden"
    >
      Print or save as PDF
    </button>
  );
}
