"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetLibraryCategoriesSummaryQuery } from "@/store/api/libraryApi";
import { Loader2 } from "lucide-react";

export default function LibrariesIndex() {
  const router = useRouter();
  const { data, isLoading } = useGetLibraryCategoriesSummaryQuery();

  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      router.replace(`/enterprise/libraries/${data.data[0]._id}`);
    }
  }, [data, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
    </div>
  );
}
