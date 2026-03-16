"use client";

import { useParams } from "next/navigation";
import { LibraryCategoryView } from "@/components/libraries/LibraryCategoryView";

export default function SoloCategoryPage() {
  const { category } = useParams<{ category: string }>();
  return <LibraryCategoryView categoryId={category ?? "earthworks"} />;
}
