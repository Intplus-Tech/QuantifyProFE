import type { Project } from "@/types/projects";

/**
 * Where "open project" lands.
 *
 * AI and manual projects have different workspaces, so a single
 * `${basePath}/${id}` sends AI projects to the manual canvas — a screen with no
 * drawings, no session and nothing to do. Every entry point (dashboard table,
 * projects grid, project card menu) resolves the destination here so they can't
 * drift apart again.
 */
export const isAiProject = (project: Pick<Project, "processingMode">) =>
  project.processingMode === "ai";

export function projectHref(
  project: Pick<Project, "_id" | "processingMode">,
  basePath = "/projects",
): string {
  // Straight to the AI report rather than via `/projects/:id/boq`, which only
  // renders a loader and then redirects here anyway — and silently lands on
  // the manual BOQ screen for any project whose processingMode didn't load.
  return isAiProject(project)
    ? `${basePath}/ai/${project._id}/report/boq`
    : `${basePath}/${project._id}`;
}

export const projectBoqHref = (
  project: Pick<Project, "_id" | "processingMode">,
  basePath = "/projects",
) =>
  isAiProject(project)
    ? `${basePath}/ai/${project._id}/report/boq`
    : `${basePath}/${project._id}/boq`;
