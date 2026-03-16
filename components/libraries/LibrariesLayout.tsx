"use client";

import { LibrariesSidebar } from "./LibrariesSidebar";
import { libraryCategories } from "./mock-data";

interface LibrariesLayoutProps {
  children: React.ReactNode;
  basePath: string;
}

export function LibrariesLayout({ children, basePath }: LibrariesLayoutProps) {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6 items-start bg-slate-50/50 min-h-screen">
      <LibrariesSidebar basePath={basePath} categories={libraryCategories} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
