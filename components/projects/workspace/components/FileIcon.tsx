"use client";

import { Image, Box, PenLine, FileText } from "lucide-react";
import type { DrawingFile } from "@/store/slices/manualWizardSlice";

export function FileIcon({ category }: { category: DrawingFile["category"] }) {
  if (category === "image") return <Image className="w-3 h-3 shrink-0 text-blue-400" />;
  if (category === "bim-3d") return <Box className="w-3 h-3 shrink-0 text-violet-400" />;
  if (category === "cad-2d") return <PenLine className="w-3 h-3 shrink-0 text-cyan-400" />;
  return <FileText className="w-3 h-3 shrink-0 text-orange-400" />;
}
