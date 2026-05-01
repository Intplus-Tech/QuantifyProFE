import { TakeoffItemView } from "@/components/projects/takeoff/TakeoffItemView";

interface TakeoffPageProps {
  params: Promise<{ projectId: string; section: string; item: string }>;
}

export default async function TakeoffPage({ params }: TakeoffPageProps) {
  const { projectId, section, item } = await params;
  console.log("sectoin", section, "item", item);

  return (
    <h1>hey</h1>
    // <TakeoffItemView
    //   projectId={projectId}
    //   basePath="/projects"
    //   section={section}
    //   item={item}
    // />
  );
}
