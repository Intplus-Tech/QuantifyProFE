import { TakeoffItemView } from "@/components/projects/takeoff/TakeoffItemView";

interface TakeoffPageProps {
  params: Promise<{ projectId: string; section: string; item: string }>;
}

export default async function TakeoffPage({ params }: TakeoffPageProps) {
  const { projectId, section, item } = await params;
  return (
    <TakeoffItemView
      projectId={projectId}
      basePath="/enterprise/projects"
      section={section}
      item={item}
    />
  );
}
