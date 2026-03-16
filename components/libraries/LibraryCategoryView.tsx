"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LibraryLocationTabs } from "./LibraryLocationTabs";
import { LibraryTable } from "./LibraryTable";
import { allCategoryData, defaultLocations } from "./mock-data";

interface LibraryCategoryViewProps {
  categoryId: string;
}

export function LibraryCategoryView({ categoryId }: LibraryCategoryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeLocation =
    searchParams.get("location") ?? defaultLocations[0] ?? "";

  function handleLocationChange(location: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("location", location);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const categoryData =
    allCategoryData[categoryId] ?? allCategoryData["default"];

  const activeItems =
    categoryData.locationItems?.[activeLocation] ?? categoryData.items;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {categoryData.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {categoryData.subtitle}
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          Add New Item
        </Button>
      </div>

      {/* Location Tabs */}
      <LibraryLocationTabs
        locations={defaultLocations}
        activeLocation={activeLocation}
        onLocationChange={handleLocationChange}
      />

      {/* Table */}
      <LibraryTable categoryData={categoryData} items={activeItems} activeLocation={activeLocation} />
    </div>
  );
}
