"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LibraryLocationTabs } from "./LibraryLocationTabs"; // Re-checking import path
import { LibraryTableLive } from "./LibraryTableLive";
import { AddLibraryItemModal } from "./AddLibraryItemModal";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  useGetLibraryItemsQuery,
  useGetLibraryLocationsQuery,
  useGetLibraryCategoriesQuery,
} from "@/store/api/libraryApi";

interface LibraryCategoryViewProps {
  categoryId: string;
  basePath: string;
}

export function LibraryCategoryView({ categoryId, basePath }: LibraryCategoryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);

  const { data: locationsData, isLoading: isLoadingLocations } = useGetLibraryLocationsQuery();
  const { data: categoriesData } = useGetLibraryCategoriesQuery();

  const locations = locationsData?.data || [];
  const activeLocation = searchParams.get("location") ?? locations[0] ?? "";

  const category = categoriesData?.data?.find((c) => c._id === categoryId);
  const categoryName = category?.name ?? "Library";

  const { data: itemsData, isLoading: isLoadingItems, isFetching } = useGetLibraryItemsQuery({
    categoryId,
    state: activeLocation || undefined,
    page: 1,
    limit: 50,
  });

  const items = itemsData?.data || [];
  const total = itemsData?.pagination?.total ?? 0;

  function handleLocationChange(location: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("location", location);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {categoryName} <span className="text-muted-foreground font-normal text-base">Rate</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage unit rates for {categoryName.toLowerCase()} items.
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </Button>
      </div>

      {/* Location Tabs */}
      {isLoadingLocations ? (
        <Skeleton className="h-12 w-full rounded-lg" />
      ) : locations.length > 0 ? (
        <LibraryLocationTabs
          locations={locations}
          activeLocation={activeLocation}
          onLocationChange={handleLocationChange}
        />
      ) : null}

      {/* Table */}
      {isLoadingItems ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
        </div>
      ) : (
        <LibraryTableLive
          items={items}
          total={total}
          isFetching={isFetching}
          activeLocation={activeLocation}
          categoryName={categoryName}
        />
      )}

      {/* Add Modal */}
      <AddLibraryItemModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        categoryId={categoryId}
        categoryName={categoryName}
      />
    </div>
  );
}
