"use client";

import { useParams } from "next/navigation";
import { LibraryCategoryView } from "@/components/libraries/LibraryCategoryView";

export default function SoloCategoryPage() {
  const { category } = useParams<{ category: string }>();
  return (
    <LibraryCategoryView
      key={category ?? "earthworks"}
      categoryId={category ?? "earthworks"}
      basePath="/libraries"
    />
  );
}
