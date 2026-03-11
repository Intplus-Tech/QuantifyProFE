"use client";

import { FileText } from "lucide-react";

interface TermsAndNotesProps {
  terms: string[];
}

export function TermsAndNotes({ terms }: TermsAndNotesProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between flex-wrap gap-8 pt-6">
      <div className="max-w-2xl">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Terms & Notes:
        </h3>
        <ul className="space-y-1">
          {terms.map((term, i) => (
            <li key={i} className="text-[11px] text-slate-500 font-medium">
              {term}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center justify-end mt-8 md:mt-0 min-w-[250px] pt-8 lg:pt-14">
        <div className="w-full border-t-[1.5px] border-slate-700 mb-2"></div>
        <p className="text-xs font-bold text-slate-900 uppercase">Project Manager</p>
        <p className="text-[11px] text-slate-500 mt-1">Signed & Dated</p>
      </div>
    </div>
  );
}
