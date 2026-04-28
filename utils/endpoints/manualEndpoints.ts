/**
 * Manual project creation wizard — API endpoint paths.
 *
 * These are ONLY used by the manual-mode wizard and are deliberately kept
 * in a separate file so that the AI-flow developer can work on
 * utils/endpoints/index.ts without any merge conflicts.
 */

export const manualProjectEndpoints = {
  /** PATCH /takeoff/:projectId/qs-config — Step 2 of the takeoff API flow */
  qsConfig: (projectId: string) => `/takeoff/${projectId}/qs-config`,

  /** PUT /takeoff/:projectId/structural-scope/:foundationType — Step 3 */
  structuralScope: (projectId: string, foundationType: string) =>
    `/takeoff/${projectId}/structural-scope/${foundationType}`,

  /** PATCH /projects/:projectId/finishing — Step 4 */
  finishing: (projectId: string) => `/projects/${projectId}/finishing`,

  /** PATCH /projects/:projectId/metrics — Step 5 */
  metrics: (projectId: string) => `/projects/${projectId}/metrics`,
};
