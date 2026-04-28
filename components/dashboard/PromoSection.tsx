import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PromoSectionProps {
  basePath?: string; // "/projects" or "/enterprise/projects"
  mostRecentProjectId?: string | null;
}

export function PromoSection({
  basePath = "/projects",
  mostRecentProjectId,
}: PromoSectionProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3 flex flex-col lg:flex-row gap-6 bg-background rounded-2xl p-6">
        {/* Left: Text and Button */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl mb-2 text-gray-900">
            Accelerate your <br /> quantity surveying <br /> workflow
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use Quantify Pro's AI to extract measurements from drawings in
            minutes, not hours. Upload your first drawing and see the magic
            happen.
          </p>
          <Button
            asChild
            className="bg-primary text-white font-medium w-fit px-6 py-2 rounded-full shadow-md"
          >
            <Link href={basePath}>Upload Drawing Now</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-background rounded-2xl p-6">
        <div className="flex items-center mb-2">
          <Image
            src="/icons/track.svg"
            alt="Track Progress Icon"
            width={24}
            height={24}
          />
        </div>
        <h3 className="text-lg font-semibold">
          Track project progress <br /> at a glance
        </h3>
        <p className="text-xs text-muted-foreground">
          Monitor all your projects from one dashboard. See which need
          attention, which are complete, and what's coming up next.
        </p>
        <Button asChild className="rounded-full">
          {mostRecentProjectId ? (
            <Link href={`${basePath}/${mostRecentProjectId}`}>
              Open My Recent Project
            </Link>
          ) : (
            <Link href={basePath}>Open My Recent Project</Link>
          )}
        </Button>
      </div>
    </div>
  );
}
