import { LibrariesLayout } from "@/components/libraries/LibrariesLayout";

export default function SoloLibrariesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LibrariesLayout basePath="/libraries">{children}</LibrariesLayout>
  );
}
