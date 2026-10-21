"use client";

import { Printer } from "lucide-react";

import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";

/** Opens the browser's print dialog (also "Save as PDF" on most phones). */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={buttonClass("secondary")}
    >
      <Icon icon={Printer} />
      Print or save as PDF
    </button>
  );
}
