"use client";

interface BOQDocumentHeaderProps {
  title: string;
  subtitle: string;
}

export function BOQDocumentHeader({ title, subtitle }: BOQDocumentHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
        {title}
      </h1>
      <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
    </header>
  );
}
