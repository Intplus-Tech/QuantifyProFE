"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Box,
  Hammer,
  Mountain,
  Users,
  LayoutGrid,
  Zap,
  Wrench,
} from "lucide-react";

const categories = [
  { id: "concrete", name: "Concrete", count: 124, icon: Box },
  { id: "steel", name: "Steel", count: 86, icon: Hammer },
  { id: "earthworks", name: "Earthworks", count: 42, icon: Mountain },
  { id: "labor", name: "Labor", count: 18, icon: Users },
  { id: "masonry", name: "Masonry", count: 31, icon: LayoutGrid },
  { id: "carpentry", name: "Carpentry", count: 55, icon: Wrench },
  { id: "mep", name: "MEP", count: 92, icon: Zap },
];

export default function LibrariesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-6 items-start bg-slate-50/50 min-h-screen">
      {/* Sidebar */}
      <Card className="w-full md:w-64 shrink-0 p-4 shadow-sm border-border/50 bg-white">
        <div className="mb-4 px-2">
          <h2 className="font-bold text-foreground">Categories</h2>
          <p className="text-xs text-muted-foreground">
            Filter by resource type
          </p>
        </div>
        <nav className="space-y-1">
          {categories.map((cat) => {
            const isActive = pathname.includes(`/libraries/${cat.id}`);
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/libraries/${cat.id}`}
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

      {/* Main Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
