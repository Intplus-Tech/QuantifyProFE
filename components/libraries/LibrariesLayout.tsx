"use client";

interface LibrariesLayoutProps {
  children: React.ReactNode;
}

export function LibrariesLayout({ children }: LibrariesLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto w-full">{children}</div>
    </div>
  );
}
