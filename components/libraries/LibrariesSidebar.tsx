"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import type { LibraryCategory } from "./types";

interface LibrariesSidebarProps {
  basePath: string;
  categories: LibraryCategory[];
}

export function LibrariesSidebar({ basePath, categories }: LibrariesSidebarProps) {
  const pathname = usePathname();

  return (
    <Card className="w-full md:w-64 shrink-0 p-4 shadow-sm border-border/50 bg-white">
      <div className="mb-4 px-2">
        <h2 className="font-bold text-foreground">Categories</h2>
        <p className="text-xs text-muted-foreground">Filter by resource type</p>
      </div>
      <nav className="space-y-1">
        {categories.map((cat) => {
          const isActive = pathname.includes(`/${cat.id}`);
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`${basePath}/${cat.id}`}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-600 font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </div>
              <span
                className={
                  isActive ? "text-orange-600" : "text-muted-foreground/70"
                }
              >
                {cat.count}
              </span>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
