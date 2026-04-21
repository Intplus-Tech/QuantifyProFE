import { LibrariesLayout } from "@/components/libraries/LibrariesLayout";

export default function EnterpriseLibrariesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LibrariesLayout>{children}</LibrariesLayout>
  );
}
