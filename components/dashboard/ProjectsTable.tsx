"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Project {
  name: string;
  number?: string;
  openedBy?: string;
  openedAgo?: string;
  createdDate: string;
  costSummaryDate: string;
  costSummaryUrl?: string;
  description?: string;
}

interface ProjectsTableProps {
  projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(0);

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Recent Projects</h2>
        <Button size={"lg"}>
          + New Project
        </Button>
      </div>

      <table className="w-full text-sm bg-transparent border-separate border-spacing-y-3">
        <thead />
        <tbody>
          {projects.map((project, i) => (
            <tr
              key={`${project.name}-${i}`}
              className="bg-white"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <td className="py-5 px-5 align-top rounded-l-2xl w-[44px]">
                <input type="checkbox" className="accent-primary w-4 h-4" />
              </td>

              <td className="py-5 px-4 align-top relative min-w-[330px]">
                <div className="font-medium text-[#4B4B4B] underline underline-offset-2 cursor-pointer">
                  {project.name}
                </div>
                <div className=" mt-1 leading-tight">
                  {project.number ? `#${project.number}` : "#402235"} Opened{" "}
                  {project.openedAgo || "10 days ago"} by{" "}
                  <span className="font-semibold text-[#3A3A3A]">
                    {project.openedBy || "Yash Ghori"}
                  </span>
                </div>

                {hoveredIdx === i && (
                  <div className="absolute left-0 top-14 z-10 bg-white rounded-xl shadow-md p-4 w-80 border border-[#D8DCE8]">
                    <div className="font-semibold text-[#4A5A8B] mb-2">
                      {project.name}
                    </div>
                    <div className="text-[#7E859A] mb-3 leading-relaxed">
                      {project.description ||
                        "Proposed Luxury Apartments, Ikoyi, Lagos: High-end apartments with waterfront views in an exclusive neighborhood"}
                    </div>
                    <Button className="rounded-full">
                      Open Project
                    </Button>
                  </div>
                )}
              </td>

              <td className="py-5 px-4 align-top min-w-[170px]">
                <div className="text-[#4A4A4A]">Created Date</div>
                <div className="text-[#5A5A5A] mt-1">{project.createdDate || "25/3/2023"}</div>
              </td>

              <td className="py-5 px-4 align-top min-w-[220px]">
                <div className="text-[#4A4A4A] mb-1">Cost Summaries</div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <rect x="2" y="2" width="12" height="12" rx="2" fill="#F79C00" />
                    <rect x="4" y="4" width="8" height="8" rx="1" fill="#fff" />
                  </svg>
                  <a
                    href={project.costSummaryUrl || "#"}
                    className="text-primary underline text-xs font-medium"
                  >
                    {project.costSummaryDate || "02.05.2024"} (Updated)
                  </a>
                </div>
              </td>

              <td className="py-5 px-5 align-top relative rounded-r-2xl w-[72px]">
                <div className="flex items-center justify-end">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F4F7FE]"
                    onClick={() => setMenuOpenIdx(menuOpenIdx === i ? null : i)}
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                      <circle cx="10" cy="4" r="1.5" fill="#1A2954" />
                      <circle cx="10" cy="10" r="1.5" fill="#1A2954" />
                      <circle cx="10" cy="16" r="1.5" fill="#1A2954" />
                    </svg>
                  </button>
                </div>
                {menuOpenIdx === i && (
                  <div className="absolute right-5 top-11 z-20 bg-white border border-[#D8DCE8] rounded-xl shadow-md py-2 w-32">
                    <button className="w-full text-left px-4 py-1.5 text-xs text-[#6D7592] hover:bg-[#F4F7FE]">Open Project</button>
                    <button className="w-full text-left px-4 py-1.5 text-xs text-[#6D7592] hover:bg-[#F4F7FE]">View Drawings</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
